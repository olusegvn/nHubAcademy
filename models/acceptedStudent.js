const mongoose = require("mongoose");
const { Schema } = mongoose;

const acceptedStudentSchema = new Schema({
    email: {
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

const AcceptedStudent = mongoose.model('acceptedstudent', acceptedStudentSchema);

module.exports = AcceptedStudent;
