const express = require('express');
const router = express.Router();
const Namespace = require('../models/Namespace');
const Task = require('../models/Task');
const { verifyFirebaseToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyFirebaseToken);

// GET /api/namespaces - Get all namespaces for the user
router.get('/', async (req, res) => {
  try {
    const namespaces = await Namespace.find({ userId: req.user.uid })
      .sort({ order: 1, createdAt: 1 })
      .populate('taskCount');
    
    // Get task counts for each namespace
    const namespacesWithCounts = await Promise.all(
      namespaces.map(async (namespace) => {
        const taskCount = await Task.countDocuments({ 
          namespaceId: namespace._id,
          userId: req.user.uid 
        });
        const completedCount = await Task.countDocuments({ 
          namespaceId: namespace._id,
          userId: req.user.uid,
          completed: true 
        });
        
        return {
          ...namespace.toObject(),
          taskCount,
          completedCount,
          pendingCount: taskCount - completedCount
        };
      })
    );
    
    res.json({
      namespaces: namespacesWithCounts,
      total: namespacesWithCounts.length
    });
    
  } catch (error) {
    console.error('Fetch namespaces error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch namespaces', 
      message: error.message 
    });
  }
});

// GET /api/namespaces/:id - Get a specific namespace
router.get('/:id', async (req, res) => {
  try {
    const namespace = await Namespace.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!namespace) {
      return res.status(404).json({ 
        error: 'Namespace not found' 
      });
    }
    
    // Get task counts
    const taskCount = await Task.countDocuments({ 
      namespaceId: namespace._id,
      userId: req.user.uid 
    });
    const completedCount = await Task.countDocuments({ 
      namespaceId: namespace._id,
      userId: req.user.uid,
      completed: true 
    });
    
    res.json({
      namespace: {
        ...namespace.toObject(),
        taskCount,
        completedCount,
        pendingCount: taskCount - completedCount
      }
    });
    
  } catch (error) {
    console.error('Fetch namespace error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch namespace', 
      message: error.message 
    });
  }
});

// POST /api/namespaces - Create a new namespace
router.post('/', async (req, res) => {
  try {
    const { name, description, color, icon, order } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Namespace name is required' 
      });
    }
    
    // Check if namespace with same name already exists for this user
    const existingNamespace = await Namespace.findOne({ 
      userId: req.user.uid, 
      name: name.trim() 
    });
    
    if (existingNamespace) {
      return res.status(409).json({ 
        error: 'Namespace already exists',
        message: 'A namespace with this name already exists' 
      });
    }
    
    const namespace = new Namespace({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#1976d2',
      icon: icon || 'FolderIcon',
      userId: req.user.uid,
      order: order || 0
    });
    
    await namespace.save();
    
    res.status(201).json({
      message: 'Namespace created successfully',
      namespace: {
        ...namespace.toObject(),
        taskCount: 0,
        completedCount: 0,
        pendingCount: 0
      }
    });
    
  } catch (error) {
    console.error('Create namespace error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Namespace already exists',
        message: 'A namespace with this name already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create namespace', 
      message: error.message 
    });
  }
});

// PUT /api/namespaces/:id - Update a namespace
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, icon, order } = req.body;
    
    const namespace = await Namespace.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!namespace) {
      return res.status(404).json({ 
        error: 'Namespace not found' 
      });
    }
    
    // Check if new name conflicts with existing namespace
    if (name && name.trim() !== namespace.name) {
      const existingNamespace = await Namespace.findOne({ 
        userId: req.user.uid, 
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      
      if (existingNamespace) {
        return res.status(409).json({ 
          error: 'Namespace already exists',
          message: 'A namespace with this name already exists' 
        });
      }
    }
    
    // Update fields
    if (name !== undefined) namespace.name = name.trim();
    if (description !== undefined) namespace.description = description?.trim();
    if (color !== undefined) namespace.color = color;
    if (icon !== undefined) namespace.icon = icon;
    if (order !== undefined) namespace.order = order;
    
    await namespace.save();
    
    // Get task counts
    const taskCount = await Task.countDocuments({ 
      namespaceId: namespace._id,
      userId: req.user.uid 
    });
    const completedCount = await Task.countDocuments({ 
      namespaceId: namespace._id,
      userId: req.user.uid,
      completed: true 
    });
    
    res.json({
      message: 'Namespace updated successfully',
      namespace: {
        ...namespace.toObject(),
        taskCount,
        completedCount,
        pendingCount: taskCount - completedCount
      }
    });
    
  } catch (error) {
    console.error('Update namespace error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Namespace already exists',
        message: 'A namespace with this name already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update namespace', 
      message: error.message 
    });
  }
});

// DELETE /api/namespaces/:id - Delete a namespace
router.delete('/:id', async (req, res) => {
  try {
    const namespace = await Namespace.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!namespace) {
      return res.status(404).json({ 
        error: 'Namespace not found' 
      });
    }
    
    // Check if namespace has tasks
    const taskCount = await Task.countDocuments({ 
      namespaceId: namespace._id,
      userId: req.user.uid 
    });
    
    if (taskCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete namespace',
        message: `This namespace contains ${taskCount} task(s). Please move or delete all tasks first.`
      });
    }
    
    await Namespace.deleteOne({ _id: req.params.id });
    
    res.json({
      message: 'Namespace deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete namespace error:', error);
    res.status(500).json({ 
      error: 'Failed to delete namespace', 
      message: error.message 
    });
  }
});

// POST /api/namespaces/reorder - Reorder namespaces
router.post('/reorder', async (req, res) => {
  try {
    const { namespaceIds } = req.body;
    
    if (!Array.isArray(namespaceIds)) {
      return res.status(400).json({ 
        error: 'Invalid data',
        message: 'namespaceIds must be an array' 
      });
    }
    
    // Update order for each namespace
    const updatePromises = namespaceIds.map((id, index) => 
      Namespace.updateOne(
        { _id: id, userId: req.user.uid },
        { order: index }
      )
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      message: 'Namespaces reordered successfully'
    });
    
  } catch (error) {
    console.error('Reorder namespaces error:', error);
    res.status(500).json({ 
      error: 'Failed to reorder namespaces', 
      message: error.message 
    });
  }
});

module.exports = router; 