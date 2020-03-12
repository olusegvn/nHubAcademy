const mongoose = require("mongoose");
const { Schema } = mongoose;

const internExeatSchema = new Schema({
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
    internId: {
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

const InternExeat = mongoose.model('internexeat', internExeatSchema);

module.exports = InternExeat;
