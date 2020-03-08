const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')
const validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} in not valid role'
}

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    email: {
        type: String,
        required: [true, 'The email is required'],
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'The password is required']
    },
    img: { type: String },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: validRoles,
        required: [true, 'The password is required']
    },
    status: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
})

// Para quitar el attr password de las respuestas en json
userSchema.methods.toJSON = function() {
    let user = this
    let userObj = user.toObject()
    delete userObj.password

    return userObj;
}

userSchema.plugin(uniqueValidator, { message: '{PATH} ya existe' })

module.exports = mongoose.model('User', userSchema)