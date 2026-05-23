const mongoose = require('mongoose');

const trashSchema = new mongoose.Schema({
  collectionName: { type: String, required: true },
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  documentName: { type: String }, // To show what it was (e.g., patient name, ledger name)
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // The original JSON
  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Trash', trashSchema);
