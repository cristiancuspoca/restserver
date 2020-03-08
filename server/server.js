require('./config/config')
const express = require('express')
const mongoose = require('mongoose');
const app = express()
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Routes users
app.use(require('./routes/users'))

mongoose.connect('mongodb://localhost:27017/cafe', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

app.listen(process.env.PORT, () => {
    console.log('executing server in port ' + process.env.PORT)
})