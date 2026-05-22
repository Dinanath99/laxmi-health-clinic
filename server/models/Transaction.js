const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, index: true },
  particulars: String,
  billNo: String,
  amountDR: { type: Number, default: 0 },
  amountCR: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  remark: String,
  type: { type: String, enum: ["cash", "purchase", "opening_balance"] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
