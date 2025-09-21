const express = require('express');
const { existsSync } = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/invoke', async (req, res) => {
    const { path, event, context } = req.body;

    // Handle the event based on the path
    if (!existsSync(path)) {
        return res.status(404).send({ error: 'Function not found' });
    }

    try {
        const module = await import(path);
        if (!module.handler) {
            return res.status(400).send({ error: 'Handler function not found' });
        }
    } catch (err) {
        return res.status(500).send({ error: 'Error loading module' });
    }

    try {
        const result = await module.handler(event, context);
        return res.send({ result });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Pod server running at http://localhost:${port}`);
});
