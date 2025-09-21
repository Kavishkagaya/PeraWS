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
        let stdout = '';
        let stderr = '';

        const outStream = {
            write: (chunk) => { stdout += chunk.toString(); }
        };
        const errStream = {
            write: (chunk) => { stderr += chunk.toString(); }
        };

        exec.exec(
            namespace,
            podName,
            'node-container', // replace with your container name
            command,
            outStream,
            errStream,
            null,
            false, // tty
            (status) => {
                if (status?.status === 'Success') {
                    resolve({
                        statusCode: 200,
                        body: stdout.trim(),
                    });
                } else {
                    resolve({
                        statusCode: 500,
                        error: stderr.trim() || 'Command failed',
                    });
                }
            }
        ).catch(reject);
    });
};


module.exports = {
    createNamespace,
    createPod,
    deletePod,
    execInPod,
    listPods
}