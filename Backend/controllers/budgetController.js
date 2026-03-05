const Budget = require("../models/Budget");

// SET / UPDATE BUDGET
const setBudget = async (req, res) => {
  try {
    const { month, limit } = req.body;

    if (!month || !limit) {
      return res.status(400).json({ message: "Month and limit required" });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { limit },
      { new: true, upsert: true }
    );

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BUDGETS (single month if month query is given, otherwise all months)
const getBudget = async (req, res) => {
  try {
    const { month } = req.query;

    if (month) {
      const budget = await Budget.findOne({
        user: req.user._id,
        month,
      });

      return res.json(budget);
    }

    const budgets = await Budget.find({ user: req.user._id }).sort({ month: 1 });
    return res.json(budgets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { setBudget, getBudget };
