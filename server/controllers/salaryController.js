const { StaffSalary } = require('../models');

exports.getSalaries = async (req, res) => {
  try {
    const salaries = await StaffSalary.find().sort({ year: -1, nepaliMonth: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addSalary = async (req, res) => {
  try {
    const { staffName, nepaliDate, nepaliMonth, year, basicSalary, advanceDeduction, remarks } = req.body;
    
    // Auto calculate net paid
    const netPaid = Number(basicSalary) - Number(advanceDeduction || 0);

    const salary = new StaffSalary({
      staffName,
      nepaliDate,
      nepaliMonth,
      year,
      basicSalary: Number(basicSalary),
      advanceDeduction: Number(advanceDeduction || 0),
      netPaid,
      remarks,
      createdBy: req.user.id
    });
    
    await salary.save();
    res.status(201).json(salary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, advanceDeduction } = req.body;
    
    // Auto re-calculate
    if (basicSalary !== undefined || advanceDeduction !== undefined) {
      req.body.netPaid = Number(basicSalary || req.body.basicSalary || 0) - Number(advanceDeduction || req.body.advanceDeduction || 0);
    }
    
    const updated = await StaffSalary.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    await StaffSalary.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
