const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: false
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
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

BudgetSchema.pre('validate', function (next) {
  if (!this.organization && !this.owner) {
    this.invalidate('owner', 'Budget must belong to an organization or a user');
  }
  if (typeof next === 'function') {
    next();
  }
});

BudgetSchema.index(
  { organization: 1, month: 1, year: 1 },
  { unique: true, sparse: true }
);
BudgetSchema.index(
  { owner: 1, month: 1, year: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Budget', BudgetSchema);
