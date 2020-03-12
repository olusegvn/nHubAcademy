const mongoose = require("mongoose");
const { Schema } = mongoose;

const internSignOutSchema = new Schema({
    fullName: {
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

const InternSignOut = mongoose.model('internSignOut', internSignOutSchema);

module.exports = InternSignOut;
