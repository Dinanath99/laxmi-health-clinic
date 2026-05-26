const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phone: { type: String, index: true },
    address: { type: String },
    diagnosis: { type: String },
    chiefComplaints: { type: String },
    pastMedicalHistory: { type: String },
    bp: { type: String },
    pulse: { type: String },
    investigation: { type: String },
    temp: { type: String },
    spo2: { type: String },
    weight: { type: String },
    pilccod: { type: String },
    cns: { type: String },
    cvs: { type: String },
    rs: { type: String },
    pa: { type: String },
    items: [
      {
        particular: { type: String },
        rate: { type: Number },
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", patientSchema);
