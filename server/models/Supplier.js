const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  address: String,
  phone: String,
  email: String
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
