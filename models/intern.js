const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const internSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    internId: {
        type: String,
        required: true,
    },
    institution:{
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    confirmPassword: {
        type: String,
        required: false
    },
    profilePicture:{
        type:String,
        default:'https://res.cloudinary.com/raymondtemtsen/image/upload/v1564823298/favicon_ajmrxh.png'
    },
    userType: {
        type: String,
        required: true
    },
    startingDate:{
        type: String,
        required: true
    },
    endingDate: {
        type: String,
        required: true
    },
    applicationLetter: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    
    secretToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

internSchema.plugin(passportLocalMongoose);
const Intern = mongoose.model('intern', internSchema);

module.exports = Intern;

module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);

    } catch (error) {
        throw new Error('Hashing failed', error);
    }
};

module.exports.comparePasswords = async (password, hashPassword) => {
    try {

        return await bcrypt.compare(password, hashPassword)
    } catch (error) {
        throw new Error("comparing failed", error);
    }
}