const { Supplier, SupplierTransaction } = require('../models');

exports.getSuppliersSummary = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    const summary = [];
    
    // For each supplier, sum debits, credits, and get balance
    for (const sup of suppliers) {
      const txs = await SupplierTransaction.find({ supplierId: sup._id });
      const totalDebit = txs.reduce((sum, tx) => sum + (tx.debit || 0), 0);
      const totalCredit = txs.reduce((sum, tx) => sum + (tx.credit || 0), 0);
      const balanceDue = totalDebit - totalCredit;
      
      summary.push({
        _id: sup._id,
        name: sup.name,
        totalDebit,
        totalCredit,
        balanceDue,
        entriesCount: txs.length,
        status: balanceDue > 0 ? '⚠ Due' : '✓ Cleared'
      });
    }
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupplierLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const txs = await SupplierTransaction.find({ supplierId: id }).sort({ date: 1 });
    const supplier = await Supplier.findById(id);
    res.json({ supplier, transactions: txs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSupplierTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, description, debit, credit, notes, openingBalance } = req.body;
    
    let previousBalance = 0;
    if (openingBalance !== undefined && openingBalance !== '' && openingBalance !== null) {
      previousBalance = Number(openingBalance);
    } else {
      const previousLogs = await SupplierTransaction.find({ supplierId: id, date: { $lt: new Date(date) } }).sort({ date: -1 }).limit(1);
      previousBalance = previousLogs.length > 0 ? previousLogs[0].balance : 0;
    }
    
    const numDebit = Number(debit) || 0;
    const numCredit = Number(credit) || 0;
    const newBalance = previousBalance + numDebit - numCredit;

    const tx = new SupplierTransaction({
      supplierId: id,
      date,
      type,
      description,
      debit: numDebit,
      credit: numCredit,
      openingBalance: (openingBalance !== undefined && openingBalance !== '') ? Number(openingBalance) : null,
      balance: newBalance,
      notes,
      createdBy: req.user.id
    });
    
    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSupplier = async (req, res) => {
  try {
    const sup = new Supplier(req.body);
    await sup.save();
    res.status(201).json(sup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await Supplier.findByIdAndDelete(id);
    // Also delete associated transactions to keep db clean
    await SupplierTransaction.deleteMany({ supplierId: id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSupplierTransaction = async (req, res) => {
  try {
    const { txId } = req.params;
    const { debit, credit, openingBalance } = req.body;

    const tx = await SupplierTransaction.findById(txId);
    if (!tx) return res.status(404).json({ error: 'Not found' });

    let previousBalance = 0;
    if (openingBalance !== undefined && openingBalance !== '' && openingBalance !== null) {
      previousBalance = Number(openingBalance);
    } else {
      const previousLogs = await SupplierTransaction.find({ 
         supplierId: tx.supplierId, 
         date: { $lt: new Date(tx.date) } 
      }).sort({ date: -1 }).limit(1);
      previousBalance = previousLogs.length > 0 ? previousLogs[0].balance : 0;
    }

    req.body.openingBalance = (openingBalance !== undefined && openingBalance !== '') ? Number(openingBalance) : null;
    req.body.balance = previousBalance + Number(debit || 0) - Number(credit || 0);

    const updated = await SupplierTransaction.findByIdAndUpdate(txId, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSupplierTransaction = async (req, res) => {
  try {
    const { txId } = req.params;
    await SupplierTransaction.findByIdAndDelete(txId);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
