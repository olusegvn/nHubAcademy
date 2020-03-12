const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentExeatSchema = new Schema({
    timeTo: {
        type: String,
        required: true
    },
    timeFrom: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    studentId: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },

})

const StudentExeat= mongoose.model('studentexeat', studentExeatSchema);

module.exports = StudentExeat;
