import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { todoAPI } from '../../services/api';
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
  Paper,
  CircularProgress,
  Alert,
  Snackbar
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
  const [namespace, setNamespace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    checklist: ['']
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load namespace and tasks
  useEffect(() => {
    loadNamespaceAndTasks();
  }, [namespaceId]);

  const loadNamespaceAndTasks = async () => {
    try {
      setLoading(true);
      
      // Load namespace details
      const namespaceResponse = await todoAPI.getNamespaces();
      const currentNamespace = namespaceResponse.data.namespaces.find(
        ns => ns._id === namespaceId
      );
      
      if (!currentNamespace) {
        setError('Namespace not found');
        navigate('/dashboard');
        return;
      }
      
      setNamespace(currentNamespace);
      
      // Load tasks for this namespace
      const tasksResponse = await todoAPI.getTasks({ namespaceId });
      setTasks(tasksResponse.data.tasks || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const taskData = {
        title: newTask.title.trim(),
        namespaceId: namespaceId,
        checklist: newTask.checklist
          .filter(item => item.trim())
          .map(text => ({ text: text.trim(), completed: false }))
      };

      const response = await todoAPI.createTask(taskData);
      setTasks([...tasks, response.data.task]);
      setNewTask({ title: '', checklist: [''] });
      setOpenDialog(false);
      setSuccess('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await todoAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      setSuccess('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const response = await todoAPI.updateTask(taskId, updatedTask);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data.task : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const response = await todoAPI.toggleTask(taskId);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data.task : task
      ));
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Failed to update task');
    }
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

  const completedTasks = tasks.filter(task => task.completed).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!namespace) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Namespace not found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 2, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" component="h1">
            {namespace.name}
          </Typography>
          {namespace.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {namespace.description}
            </Typography>
          )}
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
          <Typography color="text.secondary" mb={3}>
            Create your first task to get started organizing your work!
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Task
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task._id}>
              <TaskCard 
                task={task} 
                onDelete={() => handleDeleteTask(task._id)}
                onUpdate={(updatedTask) => handleUpdateTask(task._id, updatedTask)}
                onToggle={() => handleToggleTask(task._id)}
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

      {/* Success/Error Messages */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default NamespaceView; 