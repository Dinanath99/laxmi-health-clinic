const models = require('../models');
const { Medicine, Supplier, StaffSalary } = models;

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json([]);
    
    // Explicit global regex search
    const regex = new RegExp(q.trim(), 'i');

    const [medicines, suppliers, staff, patients] = await Promise.all([
      Medicine.find({ $or: [{ name: regex }, { genericName: regex }, { batchNo: regex }] }).limit(30),
      Supplier.find({ $or: [{ name: regex }, { phone: regex }, { address: regex }] }).limit(30),
      (models.Staff ? models.Staff.find({ $or: [{ name: regex }, { phone: regex }] }).limit(30) : Promise.resolve([])),
      (models.Patient ? models.Patient.find({ $or: [{ name: regex }, { phone: regex }] }).limit(30) : Promise.resolve([]))
    ]);

    const results = [];

    medicines.forEach(m => {
      results.push({ id: `med_${m._id}`, type: 'Medicine', name: m.name, desc: `Stock: ${m.quantity} | Batch: ${m.batchNo || 'N/A'}`, path: '/medicines' });
    });

    suppliers.forEach(s => {
      results.push({ id: `sup_${s._id}`, type: 'Supplier', name: s.name, desc: `Phone: ${s.phone || 'N/A'} | Address: ${s.address || 'N/A'}`, path: '/suppliers' });
    });

    if (staff && staff.length > 0) {
      staff.forEach(s => {
        results.push({ 
          id: `staff_${s._id}`, 
          type: 'Staff', 
          name: s.name, 
          desc: `Phone: ${s.phone || 'N/A'} | Status: ${s.status}`, 
          path: '/salary' 
        });
      });
    }

    if (patients && patients.length > 0) {
      patients.forEach(p => {
        results.push({ id: `pat_${p._id}`, type: 'Patient', name: p.name, desc: `Phone: ${p.phone || 'N/A'} | Age: ${p.age || 'N/A'}`, path: '/patients' });
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
