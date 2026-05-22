const { DailyLog } = require('../models');

exports.getDailyLogs = async (req, res) => {
  try {
    const logs = await DailyLog.find().sort({ date: 1 }); // Sort chronologically to compute running totals accurately
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addDailyLog = async (req, res) => {
  try {
    const { date, income, expense, notes } = req.body;
    
    // Calculate running total
    // Find the logically preceding log entry to get its total
    const previousLogs = await DailyLog.find({ date: { $lt: new Date(date) } }).sort({ date: -1 }).limit(1);
    const previousTotal = previousLogs.length > 0 ? previousLogs[0].total : 0;
    
    const newTotal = previousTotal + Number(income) - Number(expense);

    const log = new DailyLog({
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
