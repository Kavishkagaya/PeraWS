const { createPod, deletePod, createNamespace, listPods } = require('./podUtilities')

class PodManager {
    constructor(namespace, minPods, podManifest) {
        this.namespace = namespace;
        this.minPods = minPods;
        this.podManifest = podManifest;
        this.podPool = {};

        this.lastPodReleaseTime = Date.now();

        this.init();

    }

    async init() {
        await createNamespace(this.namespace);

        // clear previous pods in the namespace
        const existingPods = await listPods(this.namespace) || [];
        if (existingPods.length > 0)
            for (const pod of existingPods) {
                await deletePod(pod.metadata.name, this.namespace);
            }

        const needReplicas = this.minPods;
        console.log(`Creating ${needReplicas} replicas for pod ${this.namespace}`);
        for (let i = 0; i < needReplicas; i++) {
            this.podPool.push(await createPod(this.namespace, this.podManifest));
        }
    }

    async scale(isPeriodic = false) {
        const now = Date.now();
        const timeSinceLastRelease = now - this.lastPodReleaseTime;
        const currentPoolSize = this.podPool.length;

        if (timeSinceLastRelease < 60000 && currentPoolSize < this.maxPods && !isPeriodic) {
            // High demand, scale up
            for (let i = 0; i < 2; i++) {
                console.log(`Scaling up: Creating a new pod in namespace ${this.namespace}`);
                const newPod = await createPod(this.namespace, this.podManifest);
                this.podPool.push(newPod);
            }
        } else if (timeSinceLastRelease >= 300000 && currentPoolSize > this.minPods && isPeriodic) {
            // Low demand, scale down
            console.log(`Scaling down: Deleting a pod in namespace ${this.namespace}`);
            const podToDelete = this.podPool.pop();
            await deletePod(podToDelete.metadata.name, this.namespace);
        } else if (!isPeriodic) {
            // No scaling action needed replace used pod
            const newPod = await createPod(this.namespace, this.podManifest);
            this.podPool.push(newPod);
        }
    }

    periodicallyScale() {
        setInterval(() => {
            this.scale(true);
        }, 10000); // check every 10 seconds
    }

    async getPod() {
        if (this.podPool.length === 0) {
            throw new Error(`No available pods in namespace ${this.namespace}`);
        }
        // return pod and create new one without blocking
        const pod = this.podPool.shift();
        this.lastPodReleaseTime = Date.now();
        this.scale(); // scale asynchronously

        return pod;
    }
}

module.exports = {
    PodManager
};




