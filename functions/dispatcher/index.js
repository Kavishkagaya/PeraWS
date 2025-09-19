const express = require('express')
const {initPodPool} = require('./services/podManager');
const routes = require('./routes/routes');

const app = express()
initPodPool().then(() => {
    console.log("Pod pool initialized");
}).catch((err) => {
    console.error("Error initializing pod pool:", err);
    process.exit(1);
});

app.use(express.json())

app.use(routes);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})