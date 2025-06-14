import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Task as TaskIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import TaskCard from '../Task/TaskCard';

function NamespaceView() {
  const { namespaceId } = useParams();
  const navigate = useNavigate();
  const [namespaceName, setNamespaceName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    checklist: ['']
  });

  useEffect(() => {
    // Mock data - replace with API call
    const namespaceNames = {
      '1': 'Office',
      '2': 'Home',
      '3': 'Personal'
    };
    setNamespaceName(namespaceNames[namespaceId] || 'Unknown');
    
    // Mock tasks
    setTasks([
      {
        id: '1',
        title: 'Sample Task',
        checklist: [
          { text: 'First item', completed: true },
          { text: 'Second item', completed: false },
          { text: 'Third item', completed: false }
        ],
        createdAt: new Date().toISOString()
      }
    ]);
  }, [namespaceId]);

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now().toString(),
        title: newTask.title.trim(),
        checklist: newTask.checklist
          .filter(item => item.trim())
          .map(text => ({ text: text.trim(), completed: false })),
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', checklist: [''] });
      setOpenDialog(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleUpdateTask = (taskId, updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updatedTask } : task
    ));
  };

  const addChecklistItem = () => {
    setNewTask({
      ...newTask,
      checklist: [...newTask.checklist, '']
    });
  };

  const updateChecklistItem = (index, value) => {
    const updatedChecklist = [...newTask.checklist];
    updatedChecklist[index] = value;
    setNewTask({ ...newTask, checklist: updatedChecklist });
  };

  const removeChecklistItem = (index) => {
    const updatedChecklist = newTask.checklist.filter((_, i) => i !== index);
    setNewTask({ ...newTask, checklist: updatedChecklist });
  };

  const completedTasks = tasks.filter(task => 
    task.checklist.length > 0 && task.checklist.every(item => item.completed)
  ).length;

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1">
            {namespaceName}
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            <Chip 
              icon={<TaskIcon />}
              label={`${tasks.length} tasks`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              icon={<CheckCircleIcon />}
              label={`${completedTasks} completed`} 
              color="success" 
              variant="outlined" 
            />
          </Box>
        </Box>
      </Box>

      {tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks yet
          </Typography>
          <Typography color="text.secondary">
            Create your first task to get started!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
              <TaskCard 
                task={task} 
                onDelete={() => handleDeleteTask(task.id)}
                onUpdate={(updatedTask) => handleUpdateTask(task.id, updatedTask)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="h6" gutterBottom>
            Checklist Items
          </Typography>
          
          {newTask.checklist.map((item, index) => (
            <Box key={index} display="flex" alignItems="center" mb={2}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={`Item ${index + 1}`}
                value={item}
                onChange={(e) => updateChecklistItem(index, e.target.value)}
              />
              <IconButton 
                onClick={() => removeChecklistItem(index)}
                disabled={newTask.checklist.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={addChecklistItem}
            variant="outlined"
            size="small"
          >
            Add Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">Create Task</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default NamespaceView; 