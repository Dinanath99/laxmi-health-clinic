const mongoose = require('mongoose');

const staffSalarySchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', index: true },
  staffName: { type: String, required: true, index: true },
  nepaliDate: { type: String, required: true },
  nepaliMonth: { type: String, required: true, index: true },
  year: { type: String, required: true, index: true },
  basicSalary: { type: Number, default: 0, min: 0 },
  advanceDeduction: { type: Number, default: 0, min: 0 },
  netPaid: { type: Number, required: true },
  pendingDue: { type: Number, default: 0 },
  remarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StaffSalary', staffSalarySchema);
