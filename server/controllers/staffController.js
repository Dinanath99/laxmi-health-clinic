const { Staff, StaffSalary } = require('../models');

exports.getStaffSummary = async (req, res) => {
  try {
    const staffList = await Staff.find().sort({ createdAt: -1 });

    const salaries = await StaffSalary.find();
    
    // Calculate total paid per staff
    const summary = staffList.map(staff => {
      const staffPayroll = salaries.filter(s => 
        (s.staffId && s.staffId.toString() === staff._id.toString()) || 
        (!s.staffId && s.staffName === staff.name) // fallback for legacy records
      );
      
      const totalPaid = staffPayroll.reduce((sum, tx) => sum + (tx.netPaid || 0), 0);
      const totalAdvance = staffPayroll.reduce((sum, tx) => sum + (tx.advanceDeduction || 0), 0);
      const totalGenerated = staffPayroll.reduce((sum, tx) => sum + (tx.basicSalary || 0), 0);
      
      const pendingDue = staffPayroll.reduce((sum, tx) => sum + (tx.pendingDue || 0), 0);

      return {
        _id: staff._id,
        name: staff.name,
        phone: staff.phone || '-',
        status: staff.status,
        baseSalary: staff.baseSalary,
        totalPaid,
        totalAdvance,
        pendingDue,
        payrollCount: staffPayroll.length
      };
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const staff = new Staff({ ...req.body, createdBy: req.user.id });
    await staff.save();
    res.status(201).json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStaffProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });

    const payroll = await StaffSalary.find({
      $or: [ { staffId: id }, { staffName: staff.name } ]
    }).sort({ createdAt: -1 });

    const totalPaid = payroll.reduce((sum, tx) => sum + (tx.netPaid || 0), 0);
    const pendingDue = payroll.reduce((sum, tx) => sum + (tx.pendingDue || 0), 0);

    res.json({ staff, payroll, totalPaid, pendingDue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    // Optionally delete payrolls? No, keep for auditing or delete. Let's delete payroll associated so it doesn't float.
    await StaffSalary.deleteMany({ staffId: req.params.id }); 
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStaffPayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });

    const payroll = new StaffSalary({
      ...req.body,
      staffId: staff._id,
      staffName: staff.name,
      createdBy: req.user.id
    });
    
    await payroll.save();
    res.status(201).json(payroll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editStaffPayroll = async (req, res) => {
  try {
    const tx = await StaffSalary.findByIdAndUpdate(req.params.txId, req.body, { new: true });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStaffPayroll = async (req, res) => {
    try {
        await StaffSalary.findByIdAndDelete(req.params.txId);
        res.json({ message: 'Payroll removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
