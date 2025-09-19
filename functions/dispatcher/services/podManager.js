const {createPod, deletePod} = require('./podUtilities')

const podPool = {};

const pods = JSON.parse(require('./config.json')).pods;

const initPodPool = () => {
    Object.keys(pods).forEach(podName => {
        const podConfig = pods[podName];
        podPool[podName] = [];
        for (let i = 0; i < podConfig.replicas; i++) {
            podPool[podName].push(createPod(podConfig.manifest, podName));
        }
    });
};