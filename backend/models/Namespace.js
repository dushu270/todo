const mongoose = require('mongoose');

const namespaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  color: {
    type: String,
    default: '#1976d2', // Material-UI primary blue
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  icon: {
    type: String,
    default: 'FolderIcon'
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for user's namespaces
namespaceSchema.index({ userId: 1, name: 1 }, { unique: true });
namespaceSchema.index({ userId: 1, order: 1 });

// Virtual for task count (will be populated when needed)
namespaceSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'namespaceId',
  count: true
});

module.exports = mongoose.model('Namespace', namespaceSchema); 