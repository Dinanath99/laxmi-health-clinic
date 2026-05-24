const mongoose = require("mongoose");

const rentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Room", "Clinic"], required: true },
    date: { type: String, required: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    remarks: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rent", rentSchema);
