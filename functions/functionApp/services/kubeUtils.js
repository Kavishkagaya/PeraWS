const k8s = require('@kubernetes/client-node');
const stream = require('stream');

const kc = new k8s.KubeConfig();
kc.loadFromFile('./kubeconfig.yaml');

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const exec = new k8s.Exec(config=kc);

const getPodList = async (namespace) => {
    const pods = await k8sApi.listNamespacedPod({
        namespace: namespace
    })
    return pods.items
}

const getAvailablePods = async (namespace) => {
    const pods = await getPodList(namespace);
    return pods.filter(pod => pod.status.phase === "Running");
}

const deletePod = async (podName, namespace) => {
    await k8sApi.deleteNamespacedPod({
        name: podName,
        namespace: namespace
    })
}

const runCmdOnPod = async (podName, namespace, cmd) => {
    return new Promise((resolve, reject) => {
        const stdout = new stream.PassThrough();
        const stderr = new stream.PassThrough();

        let output = "";
        let errorOutput = "";

        stdout.on('data', (data) => {
            output += data.toString();
        });
        stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        const words = podName.split('-');
        const containerName = words[0]+"-"+words[1]

        exec.exec(
            namespace,
            podName,
            containerName, // container name (can be different from podName!)
            cmd,
            stdout,
            stderr,
            null, // stdin if needed
            false, // tty
            (status) => {
                if (status.status === 'Success') {
                    resolve(output.trim());
                } else {
                    reject(errorOutput || JSON.stringify(status));
                }
            }
        ).catch(reject);
    });
}

module.exports = {
    getPodList,
    getAvailablePods,
    deletePod,
    runCmdOnPod
}
