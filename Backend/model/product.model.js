const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  dateOfSale: Date,
  sold: Boolean
});

module.exports = mongoose.model('Transaction', transactionSchema);
