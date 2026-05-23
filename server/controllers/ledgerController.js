const { Transaction } = require('../models');

exports.getLedgerAccounts = async (req, res) => {
  try {
    const accounts = await Transaction.distinct("ledgerName");
    res.json(accounts.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.renameLedgerAccount = async (req, res) => {
  try {
    const { oldName } = req.params;
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ error: 'New name required' });
    await Transaction.updateMany({ ledgerName: oldName }, { $set: { ledgerName: newName } });
    res.json({ message: 'Ledger renamed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLedgerAccount = async (req, res) => {
  try {
    const { name } = req.params;
    await Transaction.deleteMany({ ledgerName: name });
    res.json({ message: 'Ledger and all associated transactions deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const query = req.query.ledgerName ? { ledgerName: req.query.ledgerName } : {};
    const txs = await Transaction.find(query).sort({ date: -1 }).limit(200);
    res.json(txs);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.addLedgerEntry = async (req, res) => {
  try {
    const { date, particulars, billNo, amountDR, amountCR, remark, ledgerName, openingBalance } = req.body;
    const finalLedgerName = ledgerName || 'Main Ledger';
    
    let previousBalance = 0;
    if (openingBalance !== undefined && openingBalance !== '' && openingBalance !== null) {
      previousBalance = Number(openingBalance);
    } else {
      const previousLogs = await Transaction.find({ 
        ledgerName: finalLedgerName,
        date: { $lt: new Date(date) } 
      }).sort({ date: -1 }).limit(1);
      previousBalance = previousLogs.length > 0 ? previousLogs[0].balance : 0;
    }
    
    // Based on uploaded image standard: Balance = previous + CR - DR
    const newBalance = previousBalance + Number(amountCR || 0) - Number(amountDR || 0);

    const tx = new Transaction({
      ledgerName: finalLedgerName,
      date,
      particulars,
      billNo,
      amountDR: Number(amountDR || 0),
      amountCR: Number(amountCR || 0),
      openingBalance: (openingBalance !== undefined && openingBalance !== '') ? Number(openingBalance) : null,
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
    const { amountDR, amountCR, openingBalance } = req.body;

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ error: 'Not found' });

    let previousBalance = 0;
    if (openingBalance !== undefined && openingBalance !== '' && openingBalance !== null) {
      previousBalance = Number(openingBalance);
    } else {
      const previousLogs = await Transaction.find({ 
        ledgerName: tx.ledgerName,
        date: { $lt: new Date(tx.date) } 
      }).sort({ date: -1 }).limit(1);
      previousBalance = previousLogs.length > 0 ? previousLogs[0].balance : 0;
    }

    req.body.openingBalance = (openingBalance !== undefined && openingBalance !== '') ? Number(openingBalance) : null;
    req.body.balance = previousBalance + Number(amountCR || 0) - Number(amountDR || 0);

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
