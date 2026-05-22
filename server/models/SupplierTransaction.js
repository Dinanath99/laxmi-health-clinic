const mongoose = require('mongoose');

const supplierTransactionSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
  date: { type: Date, required: true, index: true },
  type: { type: String, enum: ['Bill (Debit)', 'Payment (Credit)', 'Opening Balance'] },
  description: String,
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SupplierTransaction', supplierTransactionSchema);
