const client = require('@kubernetes/client-node')

const kc = new client.KubeConfig()
kc.loadFromFile(process.env.KUBECONFIG_PATH || '/home/kavishka/PeraWS/functions/dispatcher/kubeconfig.yaml')

const k8sApi = kc.makeApiClient(client.CoreV1Api)
const excec = new client.Exec()

const createNamespace = async (namespace) => {
    try {
        await k8sApi.createNamespace({body: {
            metadata: {
                name: namespace
            }
        }})
        console.log(`Namespace ${namespace} created successfully`)
    } catch (error) {
        const err = JSON.parse(error.body)
        if (err && err.code === 409) {
            console.log(`Namespace ${namespace} already exists`)
        } else {
            console.error('Error creating namespace:', err)
            throw err
        }
    }
}

const createPod = async (namespace, podManifest) => {
    console.log("Creating pod in namespace:", namespace);
    try {
        const response = await k8sApi.createNamespacedPod({
            namespace: namespace,
            body: podManifest
        })
        console.log('Pod created successfully:', response)
        return response.body
    } catch (error) {
        console.error('Error creating pod:', error)
        throw error
    }
}

const deletePod = async (podName, namespace) => {
    try {
        await k8sApi.deleteNamespacedPod({
            name: podName,
            namespace: namespace
        })
        console.log(`Pod ${podName} deleted successfully`)
    } catch (error) {
        console.error('Error deleting pod:', error)
        throw error
    }
}

const listPods = async (namespace) => {
    try {
        const response = await k8sApi.listNamespacedPod({
            namespace: namespace
        })
        return response.items
    } catch (error) {
        console.error('Error listing pods:', error)
        throw error
    }
}

const execInPod = async (podName, namespace, command) => {
    return new Promise((resolve, reject) => {
        const stdout = []
        const stderr = []

        excec.exec(namespace, podName, 'container-name', command,
            process.stdout, process.stderr, null, false /* tty */, (status) => {
                if (status.status === 'Success') {
                    resolve(stdout.join(''))
                } else {
                    reject(new Error(stderr.join('')))
                }
            })
    })
}

module.exports = {
    createNamespace,
    createPod,
    deletePod,
    execInPod,
    listPods
}