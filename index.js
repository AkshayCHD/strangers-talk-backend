const express = require('express')

const app = express();
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
    console.log(`listening to server ${PORT}`)
})