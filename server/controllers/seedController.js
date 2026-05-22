const bcrypt = require('bcryptjs');
const { User, Medicine, Supplier, Transaction, Bill } = require('../models');

exports.seedDatabase = async (req, res) => {
  try {
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Supplier.deleteMany({});
    await Transaction.deleteMany({});
    await Bill.deleteMany({});
    
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const userHash = await bcrypt.hash('Staff@123', salt);
    
    const admin = await User.create({ name: 'Admin User', email: 'admin@pharmacy.com', password: adminHash, role: 'admin' });
    const staff = await User.create({ name: 'Staff User', email: 'staff@pharmacy.com', password: userHash, role: 'user' });
    
    const s1 = await Supplier.create({ name: 'Deurali Janta', address: 'Kathmandu', phone: '9840000000', email: 'info@djpl.com' });
    const s2 = await Supplier.create({ name: 'Nepal Pharmaceuticals', address: 'Birgunj', phone: '9850000000' });
    
    await Medicine.create([
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', batchNo: 'B001', expiryDate: '2028-01-01', quantity: 500, purchasePrice: 1, sellingPrice: 2, supplierId: s1._id, lowStockThreshold: 50 },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', batchNo: 'B002', expiryDate: '2027-05-01', quantity: 200, purchasePrice: 5, sellingPrice: 8, supplierId: s1._id, lowStockThreshold: 20 },
      { name: 'Sinex Cold & Flu', genericName: 'Multivitamin', batchNo: 'B003', expiryDate: '2026-10-01', quantity: 50, purchasePrice: 20, sellingPrice: 35, supplierId: s2._id, lowStockThreshold: 10 },
      { name: 'Flexon MR', genericName: 'Ibuprofen', batchNo: 'B004', expiryDate: '2027-11-01', quantity: 150, purchasePrice: 3, sellingPrice: 5, supplierId: s2._id, lowStockThreshold: 30 },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', batchNo: 'B005', expiryDate: '2028-04-01', quantity: 100, purchasePrice: 6, sellingPrice: 10, supplierId: s1._id, lowStockThreshold: 15 }
    ]);
    
    await Transaction.create({ particulars: 'Opening Balance', amountDR: 150000, balance: 150000, type: 'opening_balance', createdBy: admin._id });
    
    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
