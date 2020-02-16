require('./config/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// REQUEST
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.get('/user', function(req, res) {
    res.json('get user')
})

app.post('/user', function(req, res) {
    res.json({
        body: req.body,
        msg: 'post user'
    })
})

app.put('/user/:id', function(req, res) {
    let id = req.params.id
    if (id === undefined) {
        res.status(400).json({
            ok: 0,
            msg: 'Error id user required'
        })
    } else {
        res.json({
            id,
            msg: 'update user'
        })
    }
})

app.delete('/user/:id', function(req, res) {
    let id = req.params.id
    res.json({
        id,
        msg: 'remover user'
    })
})

app.listen(process.env.PORT, () => {
    console.log('executing server in port ' + process.env.PORT)
})