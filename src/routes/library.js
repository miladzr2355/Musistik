const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render("library.hbs")
})


module.exports = router