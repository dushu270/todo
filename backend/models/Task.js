const mongoose = require('mongoose');

// Checklist item schema (embedded in Task)
const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  checklist: [checklistItemSchema],
  namespaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Namespace',
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ userId: 1, namespaceId: 1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Virtual for checklist completion percentage
taskSchema.virtual('checklistProgress').get(function() {
  if (!this.checklist || this.checklist.length === 0) {
    return 0;
  }
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Virtual for total checklist items
taskSchema.virtual('checklistTotal').get(function() {
  return this.checklist ? this.checklist.length : 0;
});

// Virtual for completed checklist items
taskSchema.virtual('checklistCompleted').get(function() {
  return this.checklist ? this.checklist.filter(item => item.completed).length : 0;
});

// Pre-save middleware to update completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = new Date();
    } else {
      this.completedAt = undefined;
    }
  }
  
  // Update completedAt for checklist items
  if (this.isModified('checklist')) {
    this.checklist.forEach(item => {
      if (item.isModified && item.isModified('completed')) {
        if (item.completed) {
          item.completedAt = new Date();
        } else {
          item.completedAt = undefined;
        }
      }
    });
  }
  
  next();
});

module.exports = mongoose.model('Task', taskSchema); 