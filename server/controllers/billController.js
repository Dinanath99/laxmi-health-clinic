const mongoose = require('mongoose');
const { Bill, Medicine, Transaction } = require('../models');

exports.createBill = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, grandTotal } = req.body;
    let billNo = 'BILL-' + Date.now();
    
    // 1. Create Bill
    const bill = new Bill({ billNo, items, grandTotal, createdBy: req.user.id });
    await bill.save({ session });
    
    // 2. Reduce Stock
    for (let item of items) {
      await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { quantity: -item.quantity } }, { session });
    }
    
    // 3. Add to Ledger (Debit)
    const lastTx = await Transaction.findOne().sort({ _id: -1 });
    let newBalance = (lastTx ? lastTx.balance : 0) + grandTotal; // Cash in adds to balance
    
    const tx = new Transaction({
      particulars: `Cash Sale - Bill ${billNo}`,
      billNo,
      amountDR: grandTotal,
      balance: newBalance,
      type: 'cash',
      createdBy: req.user.id
    });
    await tx.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(bill);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
};
