const express = require('express')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const _ = require('underscore')

const app = express()

app.post('/login', (req, res) => {
    let body = req.body

    User.findOne({email: body.email}, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: 0,
                err,
                msg: 'Unexpected error'
            })
        }

        if ( ! userDB ) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'User with this user/pwd not finded'
            })
        }

        if ( !bcrypt.compareSync( body.password, userDB.password ) ) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'User with this user/pwd not finded'
            })
        } else {
            let token = jwt.sign({
                user: userDB
            }, process.env.SEED_TOKEN, { expiresIn: 60 * 60 * 24 * 30})

            res.json({
                ok: 1,
                err: '',
                msg: 'Success login',
                token
            })
        }
    })
})

module.exports = app;
