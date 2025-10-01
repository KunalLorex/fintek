const express = require('express');
const app = express();

const morgan = require("morgan");
const cors = require("cors");

const port = process.env.PORT || 8001



require("dotenv").config();
app.use(morgan("dev"))
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