const express = require('express');
const fs = require('fs');
const path = require('path');
const {verifyTokenImg} = require('../middlewares/authentication')

const app = express();

app.get('/image/:type/:img', verifyTokenImg, (req, res) => {
    let type = req.params.type;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${type}/${img}`);
    let pathDefaultImage = path.resolve(__dirname, '../assets/no-image.png');
    
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg)
    } else {
        res.sendFile(pathDefaultImage)
    }
});

module.exports = app;