const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  baseSalary: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'On Leave', 'Terminated'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
