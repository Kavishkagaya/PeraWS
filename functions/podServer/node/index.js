const path = require('path');

const args = process.argv
const basePath = process.env.BASE_PATH || "/home/kavishka/function"

if (args.length < 4)
    return "not enough args"

const event = JSON.parse(args[2])
const context = JSON.parse(args[3])

const { runtime, func } = context

const funcPath = path.join(basePath, runtime, func, "handler.js")

const { handler } = require(funcPath);

// Execute handler
(async () => {
    try {
        const result = await handler(event, context);
        console.log(JSON.stringify(result)); 
    } catch (err) {
        console.error(JSON.stringify({
            error: err
        }));
        process.exit(1);
    }
})();