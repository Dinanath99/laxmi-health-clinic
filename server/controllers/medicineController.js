const { Medicine } = require('../models');

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().populate('supplierId', 'name');
    res.json(medicines);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const med = new Medicine(req.body);
    await med.save();
    res.status(201).json(med);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
