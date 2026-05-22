const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    genericName: String,
    batchNo: String,
    expiryDate: Date,
    quantity: { type: Number, required: true, default: 0, min: 0 },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      index: true,
    },
    lowStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Medicine", medicineSchema);
