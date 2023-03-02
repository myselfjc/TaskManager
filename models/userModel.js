const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true
    },
    lastName : {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail,'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 32,
        select:false
    },
    confirmPassword: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 32,
        validate: {
            validator : function(el){
            return el === this.password
        }, 
        message: 'Password not matching!'
    }},
    verified : {
        type: Boolean,
        default : false
    },
    otp : Number,
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

userSchema.methods.checkPassword = async function(candidatePassword,userPassword){
    return bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.createOtp = async function(){
    const otp = Math.floor(100000 + Math.random() * 90000);
    return otp
}

const User = new mongoose.model('user',userSchema);

module.exports = User;