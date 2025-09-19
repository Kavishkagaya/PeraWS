const { createPod, deletePod, createNamespace, listPods } = require('./podUtilities')
const pods = require('./config.json').pods;

const podPool = {};

const initPodPool = async () => {
    for (const podName of Object.keys(pods)) {
        await createNamespace(podName);

        // clear previous pods in the namespace
        const existingPods = await listPods(podName) || [];
        if (existingPods.length > 0)
            for (const pod of existingPods) {
                await deletePod(pod.metadata.name, podName);
            }

        const needReplicas = pods[podName].replicas;
        const podConfig = pods[podName];
        podPool[podName] = [];
        console.log(`Creating ${needReplicas} replicas for pod ${podName}`);
        for (let i = 0; i < needReplicas; i++) {
            podPool[podName].push(await createPod(podName, podConfig.manifest));
        }
    }
};

module.exports = {
    initPodPool
};




