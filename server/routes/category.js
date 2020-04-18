const express = require('express')
const Category = require('../models/category')
const _ = require('underscore')
const {verifyToken, verifyAdminRole} = require('../middlewares/authentication')

const app = express()

app.get('/category', function(req, res) {
    let filters = {}
    Category.find(filters, 'description user')
        .sort('description') // Order DESC by description
        .populate('user', 'name email')  // Query data relationed with id user
        .exec((err, categoryDB) => {
            if (err) {
                return res.status(400).json({
                    ok: 0,
                    err,
                    msg: 'Error categories not finded'
                })
            }

            // Obtener la cantidad total de registros
            Category.countDocuments(filters, (err, count) => {
                res.json({
                    ok: 1,
                    err: '',
                    msg: 'Category/ies finded',
                    categories: categoryDB,
                    total: count,
                    filters: categoryDB.length
                })
            })
        })
})

app.get('/category/:id', function(req, res) {
    let id = req.params.id
    Category.findById(id, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Error category not finded'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Category finded',
            category: categoryDB,
            total: 1,
            filters: 1
        })
    })
})

app.post('/category', verifyToken, (req, res) => {
    let body = req.body

    let category = new Category()
    category.description = body.description
    category.user = req.user._id

    category.save((err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Error database save'
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Error saving category'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Success save',
            category: categoryDB
        })
    })

})

app.put('/category/:id', verifyToken, function(req, res) {
    let id = req.params.id
    let body = _.pick(req.body, ['description', 'user'])

    if (!id) {
        return res.status(400).json({
            ok: 0,
            err,
            msg: 'Parameter :id required'
        })
    }

    let query = {
        _id: id
    }
    let options = {
        new: true, // returned updated document
        runValidators: true, // execute validation
        context: 'query', // values required in creation not will be required in update E.g password, name
    }

    Category.findOneAndUpdate(query, body, options, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Category not finded'
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: 0,
                err: {
                    category: { message: 'Category not finded' },
                    _message: 'Category not finded',
                },
                msg: 'Category not finded'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Success updated',
            category: categoryDB
        })
    })
})

app.delete('/category/:id', [verifyToken, verifyAdminRole], function(req, res) {
    let id = req.params.id || 0

    let query = {_id: id}

    Category.findOneAndDelete(query, (err, categoryDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Category not removed'
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: 0,
                err: {
                    category: { message: 'Category not finded' },
                    _message: 'Category not finded',
                },
                msg: 'Category not finded'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Category removed',
            category: categoryDB
        })
    })
})

module.exports = app;