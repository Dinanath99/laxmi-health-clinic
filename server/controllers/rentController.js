const Rent = require('../models/Rent');

exports.getRents = async (req, res) => {
  try {
    const { type } = req.query; // 'Room' or 'Clinic'
    const query = type && type !== 'All' ? { type } : {};
    const rents = await Rent.find(query).sort({ date: -1 });
    res.json(rents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addRent = async (req, res) => {
  try {
    const rent = new Rent({
      ...req.body,
      createdBy: req.user ? req.user.id : null
    });
    await rent.save();
    res.status(201).json(rent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRent = async (req, res) => {
  try {
    const { id } = req.params;
    await Rent.findByIdAndDelete(id);
    res.json({ message: "Rent Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
