const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true, unique: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    items: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
        name: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    grandTotal: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bill", billSchema);
