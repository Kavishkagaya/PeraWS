const { createEvent, runFunction, createContext, runNodeFunction } = require("../services/dispatchService")

exports.invokeNodeFunction = async (req, res) => {
    try {
        const event = createEvent("http", {
            method: req.method,
            headers: req.headers,
            query: req.query,
            body: req.body
        })

        const context = createContext(req.params.name, "node")

        const result = await runNodeFunction(event, context)

        return res.status(200).json(result)
    } catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
}