const podConfig = require('./config.json').pods;
const podManagers = {};
const { execInPod } = require('./podUtilities');

for (const namespace in podConfig) {
    const { minPods, podManifest } = podConfig[namespace];
    podManagers[namespace] = new PodManager(namespace, minPods, podManifest);
}

const runFunction = async (namespace, func) => {
    const podManager = podManagers[namespace];
    if (!podManager) {
        throw new Error(`No PodManager found for namespace ${namespace}`);
    }

    try {
        const pod = await podManager.getPod();
        const context = {
            podName: pod.metadata.name,
            namespace: podManager.namespace,
            invoked: Date.now()
        };
        const {event, path} = func;
    } catch (error) {
        console.error(`Error getting pod from namespace ${namespace}:`, error);
    }
}

module.exports = {
    podManagers
};