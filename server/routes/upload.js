const express = require('express');
const fileUpload = require('express-fileupload');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const User = require('../models/user')
const Product = require('../models/product')

const app = express();

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : 'uploads/tmp/'
}));

app.put('/upload/:type/:id', function(req, res) {
    let type = req.params.type;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: 0,
            err: {
                msg: 'No files were upload'
            }
        })
    }

    let typesAllowed = ['products', 'users'];
    if ( _.indexOf(typesAllowed, type) === -1 ) {
        return res.status(400).json({
            ok: 0,
            err: {
                msg: `Type ${type} not allowed. Types allowed ${typesAllowed.join(', ')}`
            }
        });
    }

    let file = req.files.file;
    let extAllowed = ['png', 'gif', 'jpg', 'jpeg'];
    let splitNameFile = file.name.split('.');
    let extFile = splitNameFile[splitNameFile.length - 1];
    if ( _.indexOf(extAllowed, extFile) === -1 ) {
        return res.status(400).json({
            ok: 0,
            err: {
                msg: `Type file .${extFile} not allowed. Type file allowed ${extAllowed.join(', ')}`
            }
        });
    }

    let nameFile = `${id}-${new Date().getMilliseconds()}.${extFile}`;
    file.mv(`uploads/${type}/${nameFile}`, (err) => {
        if (err) {
            return res.status(400).json({
                ok: 0,
                err
            });
        }

        if (type === 'users') {
            userImg(id, nameFile, res);
        } else {
            productImg(id, nameFile, res);
        }
    });
});

let userImg = (id, nameFile, res) => {
    User.findById(id, (err, userDB) => {
        if (err) {
            // Eliminar imagen recien subida
            deleteImg('users', nameFile);

            return res.status(500).json({
                ok: 0,
                err
            })            
        }

        if ( ! userDB) {
            // Eliminar imagen recien subida
            deleteImg('users', nameFile);

            return res.status(404).json({
                ok: 0,
                err: {
                    msg: 'User not finded'
                }
            })
        }
        let imgLast = userDB.img;

        // Actualizar imagen en db
        userDB.img = nameFile;
        userDB.save( (err, userUpdated) => {
            if (err) {
                // Eliminar imagen recien subida
                deleteImg('users', nameFile);

                return res.status(500).json({
                    ok: 0,
                    err
                });
            }

            // Eliminar la imagen que tenia el usuario antes
            deleteImg('users', imgLast);

            res.json({
                ok: 1,
                err: '',
                user: userUpdated,
                msg: 'File uploaded!'
            });
        })
    });
};

let productImg = (id, nameFile, res) => {
    Product.findById(id, (err, productDB) => {
        if (err) {
            // Eliminar imagen recien subida
            deleteImg('products', nameFile);

            return res.status(500).json({
                ok: 0,
                err
            })            
        }

        if ( ! productDB) {
            // Eliminar imagen recien subida
            deleteImg('products', nameFile);

            return res.status(404).json({
                ok: 0,
                err: {
                    msg: 'Product not finded'
                }
            })
        }
        let imgLast = productDB.img;

        // Actualizar imagen en db
        productDB.img = nameFile;
        productDB.save( (err, productUpdated) => {
            if (err) {
                // Eliminar imagen recien subida
                deleteImg('products', nameFile);

                return res.status(500).json({
                    ok: 0,
                    err
                });
            }

            // Eliminar la imagen que tenia el usuario antes
            deleteImg('products', imgLast);

            res.json({
                ok: 1,
                err: '',
                product: productUpdated,
                msg: 'File uploaded!'
            });
        })
    });
};

let deleteImg = (type, nameImg) => {
    let pathFile = path.resolve(__dirname, `../../uploads/${type}/${nameImg}`);

    if (fs.existsSync(pathFile)) {
        fs.unlinkSync(pathFile);
    }
}

module.exports = app;