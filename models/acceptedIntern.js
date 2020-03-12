const mongoose = require("mongoose");
const { Schema } = mongoose;

const acceptedInternSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    internId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },

})

const AcceptedIntern = mongoose.model('acceptedIntern', acceptedInternSchema);

module.exports = AcceptedIntern;
