const client = require('@kubernetes/client-node')

const kc = new client.KubeConfig()
kc.loadFromDefault()

const k8sApi = kc.makeApiClient(client.CoreV1Api)
const excec = new client.Exec()

const createPod = async (podManifest, namespace) => {
    try {
        const response = await k8sApi.createNamespacedPod(namespace, podManifest)
        return response.body
    } catch (error) {
        console.error('Error creating pod:', error)
        throw error
    }
}

const deletePod = async (podName, namespace) => {
    try {
        await k8sApi.deleteNamespacedPod(podName, namespace)
        console.log(`Pod ${podName} deleted successfully`)
    }
    catch (error) {
        console.error('Error deleting pod:', error)
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
    createPod,
    deletePod,
    execInPod
}