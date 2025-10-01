const express = require('express');
const app = express();

const env = require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 8001
app.use(cors())

app.get('/api', (req, res) => {
    // console.log(req.body)
    console.log("OK")
    res.send({ values: 'Hello World' })
    // return res.send('Hello World')
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})