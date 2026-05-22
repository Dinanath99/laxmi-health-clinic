const { Transaction } = require('../models');

exports.getLedger = async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ date: -1 }).limit(100);
    res.json(txs);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.addLedgerEntry = async (req, res) => {
  try {
    const { date, particulars, billNo, amountDR, amountCR, remark } = req.body;
    
    // Find previous balance chronologically
    const previousLogs = await Transaction.find({ date: { $lt: new Date(date) } }).sort({ date: -1 }).limit(1);
    const previousBalance = previousLogs.length > 0 ? previousLogs[0].balance : 0;
    
    // Based on uploaded image standard: Balance = previous + CR - DR
    const newBalance = previousBalance + Number(amountCR || 0) - Number(amountDR || 0);

    const tx = new Transaction({
      date,
      particulars,
      billNo,
      amountDR: Number(amountDR || 0),
      amountCR: Number(amountCR || 0),
      balance: newBalance,
      remark,
      createdBy: req.user.id
    });
    
    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLedgerEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLedgerEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
