const { DailyLog } = require('../models');

exports.getPharmacies = async (req, res) => {
  try {
    const list = await DailyLog.distinct("pharmacyName");
    res.json(list.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.renamePharmacy = async (req, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: 'New name required' });
    await DailyLog.updateMany({ pharmacyName: oldName }, { $set: { pharmacyName: newName } });
    res.json({ message: 'Pharmacy renamed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePharmacy = async (req, res) => {
  try {
    const { name } = req.params;
    await DailyLog.deleteMany({ pharmacyName: name });
    res.json({ message: 'Pharmacy branch and all associated logs deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDailyLogs = async (req, res) => {
  try {
    const query = req.query.pharmacyName ? { pharmacyName: req.query.pharmacyName } : {};
    const logs = await DailyLog.find(query).sort({ date: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addDailyLog = async (req, res) => {
  try {
    const { date, income, expense, notes, pharmacyName } = req.body;
    const finalPharmacyName = pharmacyName || 'Main Pharmacy';
    
    const previousLogs = await DailyLog.find({ 
       pharmacyName: finalPharmacyName, 
       date: { $lt: new Date(date) } 
    }).sort({ date: -1 }).limit(1);
    
    const previousTotal = previousLogs.length > 0 ? previousLogs[0].total : 0;
    const newTotal = previousTotal + Number(income) - Number(expense);

    const log = new DailyLog({
      pharmacyName: finalPharmacyName,
      date,
      income,
      expense,
      total: newTotal,
      notes,
      createdBy: req.user.id
    });
    
    await log.save();

    // Note: If adding a retroactive date, we would need to recalculate ALL subsequent totals.
    // For this MVP, we assume entries are added chronologically.

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateDailyLog = async (req, res) => {
  try {
    const { id } = req.params;
    // Just directly update the log details for admin override MVP
    const updated = await DailyLog.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDailyLog = async (req, res) => {
  try {
    const { id } = req.params;
    await DailyLog.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
