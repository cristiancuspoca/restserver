const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLI_GOGL_ID);
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

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLI_GOGL_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3] -> important
    });
    const payload = ticket.getPayload();
    // Payload object
    // iss: 'accounts.google.com'
    // azp: -> Clienta ID
    // aud: -> Clienta ID
    // sub: '113744291437074931360'
    // email: STRING
    // email_verified: BOOLEAN,
    // at_hash: 'Tm1U5rdFMEDOOwaYSGdufQ',
    // name: 
    // picture: URL
    // given_name: 
    // family_name: 
    // locale: 'es-419',
    // iat: 1586551015,
    // exp: 1586554615,
    // jti: '8303c43bb04482a5c40ac23586cfb8aa7ca5e581'
    // ACCESS -> E.g payload['sub'];
    return {
        name: payload['name'],
        img: payload['picture'],
        email: payload['email'],
        google: true
    }
}

app.post('/google-sigin', async (req, res) => {
    let body = req.body
    let tokenG = body.idtoken

    let googleObj = await verify(tokenG)
        .catch(err => {
            return res.status(403).json({
                ok: 0,
                err,
                msg: 'Invalid token'
            })
        })

    User.findOne({email: googleObj.email}, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: 0,
                err,
                msg: 'Unexpected error'
            })
        }

        if ( userDB ) {
            if (!userDB.google) {
                return res.status(400).json({
                    ok: 0,
                    err,
                    msg: 'Most use method normal authentication'
                })
            } 
            let token = jwt.sign({
                user: userDB
            }, process.env.SEED_TOKEN, { expiresIn: 60 * 60 * 24 * 30})

            res.json({
                ok: 1,
                err: '',
                msg: 'Success login',
                token
            })
        } else {
            // Create user
            let user = new User({
                name: googleObj.name,
                email: googleObj.email,
                img: googleObj.img,
                google: true,
                password: ':nomatch:',
                role: 'USER_ROLE'
            });

            user.save((err, userDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: 0,
                        err,
                        msg: 'Error database save user'
                    })
                }

                let token = jwt.sign({
                    user: userDB
                }, process.env.SEED_TOKEN, { expiresIn: 60 * 60 * 24 * 30})
    
                res.json({
                    ok: 1,
                    err: '',
                    msg: 'Success login',
                    token
                })
            })
        }
    })
})

module.exports = app;
