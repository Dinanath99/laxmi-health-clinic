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
    const { date, income, expense, openingBalance, notes, pharmacyName, items } = req.body;
    const finalPharmacyName = pharmacyName || 'Main Pharmacy';
    
    let previousTotal = 0;
    
    if (openingBalance !== undefined && openingBalance !== '' && openingBalance !== null) {
      previousTotal = Number(openingBalance);
    } else {
      const previousLogs = await DailyLog.find({ 
         pharmacyName: finalPharmacyName, 
         date: { $lt: new Date(date) } 
      }).sort({ date: -1 }).limit(1);
      
      previousTotal = previousLogs.length > 0 ? previousLogs[0].total : 0;
    }
    
    const newTotal = previousTotal + Number(income || 0) - Number(expense || 0);

    const log = new DailyLog({
      pharmacyName: finalPharmacyName,
      date,
      income,
      expense,
      openingBalance: (openingBalance !== undefined && openingBalance !== '') ? Number(openingBalance) : null,
      total: newTotal,
      notes,
      items: items || [],
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
    const { income, expense, openingBalance } = req.body;

    const log = await DailyLog.findById(id);
    if (!log) return res.status(404).json({ error: 'Not found' });

    let previousTotal = 0;
    if (openingBalance !== undefined && openingBalance !== '' && openingBalance !== null) {
      previousTotal = Number(openingBalance);
    } else {
      const previousLogs = await DailyLog.find({ 
         pharmacyName: log.pharmacyName, 
         date: { $lt: new Date(log.date) } 
      }).sort({ date: -1 }).limit(1);
      previousTotal = previousLogs.length > 0 ? previousLogs[0].total : 0;
    }

    req.body.openingBalance = (openingBalance !== undefined && openingBalance !== '') ? Number(openingBalance) : null;
    req.body.total = previousTotal + Number(income || 0) - Number(expense || 0);

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
