const nodePodManifest = (podName, containerPort, volumePath) => {
    return {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: podName,
        },
        spec: {
            containers: [
                {
                    name: 'container-name',
                    image: 'alpine/node:latest',
                    ports: [
                        {
                            containerPort: containerPort
                        }
                    ],
                    volumeMounts: [
                        {
                            mountPath: '/functions/node/',
                            name: 'node-volume'
                        }
                    ]
                }
            ],
            volumes: [
                {
                    name: 'node-volume',
                    hostPath: {
                        path: volumePath
                    }
                }
            ]
        }
    }
}

