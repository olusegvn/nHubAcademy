const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSignOutSchema = new Schema({
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

const StudentSignOut = mongoose.model('studentSignOut', studentSignOutSchema);

module.exports = StudentSignOut;
