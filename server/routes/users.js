const express = require('express')
const app = express()
const User = require('../models/users')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const {verifyToken, verifyAdminRole} = require('../middlewares/authentication')

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// REQUEST
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.get('/user', verifyToken, function(req, res) {
    let fromSkip = Number(req.query.from) || 0
    let limit = Number(req.query.limit) || 5
    let filters = { status: true }
    User.find(filters, 'name email role status google')
        .skip(fromSkip)
        .limit(limit)
        .exec((err, usersDB) => {
            if (err) {
                return res.status(400).json({
                    ok: 0,
                    err,
                    msg: 'Error users not finded'
                })
            }

            // Obtener la cantidad total de registros
            User.countDocuments(filters, (err, count) => {
                res.json({
                    ok: 1,
                    err: '',
                    msg: 'Users finded',
                    users: usersDB,
                    total: count,
                    filters: usersDB.length
                })
            })
        })
})

app.post('/user', [verifyToken, verifyAdminRole], function(req, res) {
    let body = req.body

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Error database save'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Success save',
            user: userDB
        })
    })
})

app.put('/user/:id', [verifyToken, verifyAdminRole], function(req, res) {
    let id = req.params.id
    // Filter only data to update
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'status'])

    let options = {
        new: true, // returned updated document
        runValidators: true, // execute validation
        context: 'query', // values required in creation not will be required in update E.g password, name
    }

    if (id === undefined) {
        return res.status(400).json({
            ok: 0,
            err,
            msg: 'Id user required'
        })
    } else {
        let query = {
            _id: id
        }
        User.findOneAndUpdate(query, body, options, (err, userDB) => {
            if (err) {
                return res.status(400).json({
                    ok: 0,
                    err,
                    msg: 'User not finded'
                })
            }

            if (!userDB) {
                return res.status(400).json({
                    ok: 0,
                    err: {
                        user: { message: 'User not finded' },
                        _message: 'User not finded',
                    },
                    msg: 'User not finded'
                })
            }

            res.json({
                ok: 1,
                err: '',
                msg: 'Success updated',
                user: userDB
            })
        })
    }
})

app.delete('/user/:id', [verifyToken, verifyAdminRole], function(req, res) {
    let id = req.params.id || 0

    let options = {
        new: true,
    }

    let query = {
        _id: id
    }

    //User.findOneAndDelete(query, options, (err, userDB) => {
    User.findOneAndUpdate(query, { status: false }, options, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'User not removed'
            })
        }

        if (!userDB) {
            return res.status(400).json({
                ok: 0,
                err: {
                    user: { message: 'User not finded' },
                    _message: 'User not finded',
                },
                msg: 'User not finded'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'User removed',
            user: userDB
        })
    })
})

module.exports = app;