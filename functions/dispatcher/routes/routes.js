const router = require('express').Router();

router.use('/functions', ()=>{
    console.log("Functions route");
})

module.exports = router;