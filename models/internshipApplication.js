const mongoose = require("mongoose");
const { Schema } = mongoose;

const internshipApplicationSchema = new Schema({
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
        required: true
    },
    institution: {
        type: String,
        required: true,
    },
    startingDate: {
        type: String,
        required: true,
    },
    endingDate: {
        type: String,
        required: true
    },
    applicationLetter: {
        type: String,
        required: true
    },
    isApproved:{
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const InternshipApplication = mongoose.model('internshipApplication', internshipApplicationSchema);

module.exports = InternshipApplication;
