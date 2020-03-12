const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSignInSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },

})

const StudentSignIn = mongoose.model('studentSignIn', studentSignInSchema);

module.exports = StudentSignIn;
