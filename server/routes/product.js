const express = require('express')
const Product = require('../models/product')
const _ = require('underscore')
const {verifyToken} = require('../middlewares/authentication')

const app = express()

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// REQUEST
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.get('/product', (req, res) => {
    let query = _.pick(req.query, ['from', 'limit', 'available', 'description', 'unitPrice']);
    let fromSkip = Number(query.from) || 0
    let limit = Number(query.limit) || 5
    let filters = _.pick(query, ['name', 'available', 'description', 'unitPrice'])
    filters.available = filters.available === undefined ? true : filters.available
    
    Product.find(filters, 'name unitPrice description available category user')
        .skip(fromSkip)
        .limit(limit)
        .sort('avilable') // Order
        .populate('category', 'description')
        .populate('user', 'email')  // Query data relationed with id user
        .exec((err, productDB) => {
            if (err) {
                return res.status(400).json({
                    ok: 0,
                    err
                })
            }

            // Obtener la cantidad total de registros
            Product.countDocuments(filters, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: 0,
                        err,
                        msg: 'Error count results'
                    })
                }

                res.json({
                    ok: 1,
                    err: '',
                    msg: 'Products finded',
                    products: productDB,
                    total: count,
                    filters: productDB.length
                })
            })
        })
})

app.get('/product/:id', (req, res)  => {
    let id = req.params.id

    if (id === undefined)  {
        return res.status(400).json({
            ok: 0,
            err: {
                msg: ':id product required'
            }
        })
    }

    Product.findById(id)
        .populate('category', 'description')
        .populate('user', 'email')
        .exec((err, productDB) => {
            if (err) {
                return res.status(500).json({
                    ok: 0,
                    err
                })
            }

            if ( ! productDB) {
                return res.status(404).json({
                    ok: 0,
                    err: {
                        msg: 'Product not finded'
                    }
                })
            }

            res.json({
                ok: 1,
                err: '',
                msg: 'product finded',
                product: productDB,
                total: 1,
                filters: 1
            })
        })
})

app.get('/product/query/:term', (req, res)  => {
    let term = req.params.term
    let regexp = new RegExp(term, 'i')
    let filters = {
        $or:[ 
            {name: regexp},
            {description: regexp}
        ]
    }

    Product.find(filters)
        .populate('category', 'description')
        .exec((err, productDB) => {
            if (err) {
                return res.status(500).json({
                    ok: 0,
                    err
                })
            }

            if ( ! productDB) {
                return res.status(404).json({
                    ok: 0,
                    err: {
                        msg: 'Product not finded'
                    }
                })
            }

            // Obtener la cantidad total de registros
            Product.countDocuments(filters, (err, count) => {
                if (err) {
                    return res.status(500).json({
                        ok: 0,
                        err,
                        msg: 'Error count results'
                    })
                }

                res.json({
                    ok: 1,
                    err: '',
                    msg: 'Products finded',
                    products: productDB,
                    total: count,
                    filters: productDB.length
                })
            })
        })
})


app.post('/product', verifyToken, (req, res) => {
    let body = req.body
    let user = !!body.user ? body.user : req.user._id

    let product = new Product({
        name: body.name,
        unitPrice: body.unitPrice,
        description: body.description,
        available: body.available,
        category: body.category,
        user: user
    });

    product.save((err, productDB) => {
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
            user: productDB
        })
    })
})

app.put('/product/:id', verifyToken, (req, res) => {
    let id = req.params.id
    let body = _.pick(req.body, ['name', 'unitPrice', 'description', 'available', 'category', 'user'])

    if (!id) {
        return res.status(400).json({
            ok: 0,
            err,
            msg: 'Parameter :id required'
        })
    }

    let query = {_id: id}

    let options = {
        new: true, // returned updated document
        runValidators: true, // execute validation
        context: 'query', // values required in creation not will be required in update E.g password, name
    }

    Product.findOneAndUpdate(query, body, options, (err, productDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Product not finded'
            })
        }

        if (!productDB) {
            return res.status(400).json({
                ok: 0,
                err: {
                    product: { message: 'Product not finded' },
                    _message: 'Product not finded',
                },
                msg: 'Product not finded'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Success updated',
            product: productDB
        })
    })
})

app.delete('/product/:id', verifyToken, (req, res) => {
    let id = req.params.id || 0
    let query = {_id: id}

    // Product.findOneAndDelete(query, (err, productDB) => {
    Product.findOneAndUpdate(query, { status: false }, {new: true}, (err, productDB) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err,
                msg: 'Product not inactived'
            })
        }

        if (!productDB) {
            return res.status(400).json({
                ok: 0,
                err: {
                    product: { message: 'Product not finded' },
                    _message: 'Product not finded',
                },
                msg: 'Product not finded'
            })
        }

        res.json({
            ok: 1,
            err: '',
            msg: 'Product inactived',
            product: productDB
        })
    })
})

module.exports = app;