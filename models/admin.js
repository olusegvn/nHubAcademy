const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
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
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: true
    },
    secretToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
})

adminSchema.plugin(passportLocalMongoose);
const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
