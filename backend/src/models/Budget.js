const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: true
  },
  month: {
    type: Number,
    required: [true, 'Please add a month (1-12)'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Please add a year'],
    min: 2000
  },
  totalLimit: {
    type: Number,
    required: [true, 'Please specify the total budget limit']
  },
  alertThreshold: {
    type: Number,
    required: [true, 'Please specify the alert threshold percentage'],
    default: 80,
    min: 1,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one budget per organization per month/year
BudgetSchema.index({ organization: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
