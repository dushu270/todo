const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Namespace = require('../models/Namespace');
const { verifyFirebaseToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyFirebaseToken);

// GET /api/tasks - Get all tasks for the user with optional filters
router.get('/', async (req, res) => {
  try {
    const { 
      namespaceId, 
      completed, 
      priority, 
      dueDate, 
      search,
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = { userId: req.user.uid };
    
    if (namespaceId) query.namespaceId = namespaceId;
    if (completed !== undefined) query.completed = completed === 'true';
    if (priority) query.priority = priority;
    if (dueDate) {
      const date = new Date(dueDate);
      query.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const tasks = await Task.find(query)
      .populate('namespaceId', 'name color icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Task.countDocuments(query);
    
    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks', 
      message: error.message 
    });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    }).populate('namespaceId', 'name color icon');
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    res.json({ task });
    
  } catch (error) {
    console.error('Fetch task error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task', 
      message: error.message 
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      namespaceId, 
      priority, 
      dueDate, 
      checklist, 
      tags,
      order 
    } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Task title is required' 
      });
    }
    
    if (!namespaceId) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Namespace is required' 
      });
    }
    
    // Verify namespace belongs to user
    const namespace = await Namespace.findOne({ 
      _id: namespaceId, 
      userId: req.user.uid 
    });
    
    if (!namespace) {
      return res.status(400).json({ 
        error: 'Invalid namespace',
        message: 'Namespace not found or access denied' 
      });
    }
    
    const task = new Task({
      title: title.trim(),
      description: description?.trim(),
      namespaceId,
      userId: req.user.uid,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      checklist: checklist || [],
      tags: tags || [],
      order: order || 0
    });
    
    await task.save();
    await task.populate('namespaceId', 'name color icon');
    
    res.status(201).json({
      message: 'Task created successfully',
      task
    });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      error: 'Failed to create task', 
      message: error.message 
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      completed,
      namespaceId, 
      priority, 
      dueDate, 
      checklist, 
      tags,
      order 
    } = req.body;
    
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    // If changing namespace, verify it belongs to user
    if (namespaceId && namespaceId !== task.namespaceId.toString()) {
      const namespace = await Namespace.findOne({ 
        _id: namespaceId, 
        userId: req.user.uid 
      });
      
      if (!namespace) {
        return res.status(400).json({ 
          error: 'Invalid namespace',
          message: 'Namespace not found or access denied' 
        });
      }
    }
    
    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim();
    if (completed !== undefined) task.completed = completed;
    if (namespaceId !== undefined) task.namespaceId = namespaceId;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (checklist !== undefined) task.checklist = checklist;
    if (tags !== undefined) task.tags = tags;
    if (order !== undefined) task.order = order;
    
    await task.save();
    await task.populate('namespaceId', 'name color icon');
    
    res.json({
      message: 'Task updated successfully',
      task
    });
    
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      error: 'Failed to update task', 
      message: error.message 
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    await Task.deleteOne({ _id: req.params.id });
    
    res.json({
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      error: 'Failed to delete task', 
      message: error.message 
    });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    task.completed = !task.completed;
    await task.save();
    await task.populate('namespaceId', 'name color icon');
    
    res.json({
      message: `Task ${task.completed ? 'completed' : 'reopened'} successfully`,
      task
    });
    
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ 
      error: 'Failed to toggle task', 
      message: error.message 
    });
  }
});

// PATCH /api/tasks/:id/checklist/:itemId/toggle - Toggle checklist item
router.patch('/:id/checklist/:itemId/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    const checklistItem = task.checklist.id(req.params.itemId);
    
    if (!checklistItem) {
      return res.status(404).json({ 
        error: 'Checklist item not found' 
      });
    }
    
    checklistItem.completed = !checklistItem.completed;
    checklistItem.completedAt = checklistItem.completed ? new Date() : null;
    
    await task.save();
    await task.populate('namespaceId', 'name color icon');
    
    res.json({
      message: `Checklist item ${checklistItem.completed ? 'completed' : 'reopened'} successfully`,
      task
    });
    
  } catch (error) {
    console.error('Toggle checklist item error:', error);
    res.status(500).json({ 
      error: 'Failed to toggle checklist item', 
      message: error.message 
    });
  }
});

// POST /api/tasks/:id/checklist - Add checklist item
router.post('/:id/checklist', async (req, res) => {
  try {
    const { text, order } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Checklist item text is required' 
      });
    }
    
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    task.checklist.push({
      text: text.trim(),
      order: order || task.checklist.length
    });
    
    await task.save();
    await task.populate('namespaceId', 'name color icon');
    
    res.json({
      message: 'Checklist item added successfully',
      task
    });
    
  } catch (error) {
    console.error('Add checklist item error:', error);
    res.status(500).json({ 
      error: 'Failed to add checklist item', 
      message: error.message 
    });
  }
});

// DELETE /api/tasks/:id/checklist/:itemId - Delete checklist item
router.delete('/:id/checklist/:itemId', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user.uid 
    });
    
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }
    
    const checklistItem = task.checklist.id(req.params.itemId);
    
    if (!checklistItem) {
      return res.status(404).json({ 
        error: 'Checklist item not found' 
      });
    }
    
    checklistItem.remove();
    await task.save();
    await task.populate('namespaceId', 'name color icon');
    
    res.json({
      message: 'Checklist item deleted successfully',
      task
    });
    
  } catch (error) {
    console.error('Delete checklist item error:', error);
    res.status(500).json({ 
      error: 'Failed to delete checklist item', 
      message: error.message 
    });
  }
});

// GET /api/tasks/stats/summary - Get task statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      thisWeekTasks
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, completed: true }),
      Task.countDocuments({ userId, completed: false }),
      Task.countDocuments({ 
        userId, 
        completed: false, 
        dueDate: { $lt: new Date() } 
      }),
      Task.countDocuments({ 
        userId, 
        completed: false,
        dueDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Task.countDocuments({ 
        userId, 
        completed: false,
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);
    
    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { userId, completed: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Get tasks by namespace
    const tasksByNamespace = await Task.aggregate([
      { $match: { userId } },
      { $group: { _id: '$namespaceId', count: { $sum: 1 } } },
      { $lookup: { 
        from: 'namespaces', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'namespace' 
      }},
      { $unwind: '$namespace' },
      { $project: { 
        name: '$namespace.name', 
        color: '$namespace.color',
        count: 1 
      }}
    ]);
    
    res.json({
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        todayTasks,
        thisWeekTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      tasksByPriority,
      tasksByNamespace
    });
    
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get task statistics', 
      message: error.message 
    });
  }
});

module.exports = router; 