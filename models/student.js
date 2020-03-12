const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const studentSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
    },
    studentId: {
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
    userType: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/raymondtemtsen/image/upload/v1564823298/favicon_ajmrxh.png'
    },
    date: {
        type: Date,
        default: Date.now
    },

    secretToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

studentSchema.plugin(passportLocalMongoose);
const Student = mongoose.model('student', studentSchema);

module.exports = Student;

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