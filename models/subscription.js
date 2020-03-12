const mongoose = require("mongoose");

const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  email: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

const Subscription = mongoose.model("subscription", subscriptionSchema);

module.exports = Subscription;

