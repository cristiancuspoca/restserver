const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

const productShema = new Schema({
    description: {
        type: String,
        unique: true,
        required: [true, 'The description is required']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


// Validacion para campos unicos
productShema.plugin(uniqueValidator, { message: '{PATH} ya existe' })

module.exports = mongoose.model('Category', productShema)