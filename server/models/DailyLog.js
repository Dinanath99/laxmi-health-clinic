const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true },
    income: { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DailyLog", dailyLogSchema);
