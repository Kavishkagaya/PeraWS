const { getAvailablePods, runCmdOnPod } = require("./kubeUtils")

const createContext = (func, runtime) => {
    return {
        func: func,
        runtime: runtime,
        time: Date.now()
    }
}

const createEvent = (type, content) => {
    if (type == "http") return {
        httpMethod: content.method || "GET",
        headers: content.headers || {},
        queryStringParameters: content.query || {},
        body: content.body || {}
    }
    return content
}

const getAvailablePod = async (runtime) => {
    return (await getAvailablePods(runtime))[0]
}

const runFunction = async (event, context, command = []) => {
    const pod = await getAvailablePod(context.runtime)

    // Command to run Node function with event & context serialized
    const cmd = [
        ...command,
        JSON.stringify(event),
        JSON.stringify(context)
    ]

    // Execute command inside pod and get output
    const result = await runCmdOnPod(pod.metadata.name, pod.metadata.namespace, cmd)

    // Expect the function to return JSON string
    try {
        return JSON.parse(result)
    } catch (e) {
        console.error("Failed to parse function output:", result)
        throw e
    }
}

runNodeFunction = async (event, context) => {
    return await runFunction(event, context, ["node", "index.js"])
}

module.exports = {
    runFunction,
    runNodeFunction,
    createEvent,
    createContext
}