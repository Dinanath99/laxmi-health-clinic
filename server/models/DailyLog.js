const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
  {
    pharmacyName: {
      type: String,
      required: true,
      default: "Main Pharmacy",
      index: true,
    },
    date: { type: Date, required: true, index: true },
    income: { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
    openingBalance: { type: Number, default: null },
    total: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    notes: String,
    items: [
      {
        type: { type: String, enum: ['income', 'expense'] },
        amount: { type: Number, required: true },
        remark: { type: String }
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DailyLog", dailyLogSchema);
