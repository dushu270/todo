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
  const [showCompleted, setShowCompleted] = useState(true);
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

  const completedTasks = tasks.filter(task => {
    // A task is completed when ALL checklist items are completed
    const completedItems = task.checklist.filter(item => item.completed).length;
    const totalItems = task.checklist.length;
    return totalItems > 0 && completedItems === totalItems;
  }).length;

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
    <Box sx={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <Container sx={{ pt: 2, pb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/dashboard')} 
            sx={{ 
              mr: 2,
              backgroundColor: '#fff9c4',
              color: '#333',
              '&:hover': { backgroundColor: '#f57c00', color: 'white' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box flexGrow={1}>
            <Typography variant="h4" component="h1" sx={{ color: '#ffc107', fontWeight: 500 }}>
              {namespace.name}
            </Typography>
            {namespace.description && (
              <Typography variant="body1" sx={{ color: '#666', mt: 0.5 }}>
                {namespace.description}
              </Typography>
            )}
            <Box display="flex" gap={1} mt={1.5} alignItems="center">
              <Chip 
                icon={<TaskIcon />}
                label={`${tasks.length} tasks`} 
                sx={{
                  backgroundColor: '#fff9c4',
                  color: '#333',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}
              />
              <Chip 
                icon={<CheckCircleIcon />}
                label={`${completedTasks} completed`} 
                sx={{
                  backgroundColor: completedTasks > 0 ? '#4caf50' : '#e0e0e0',
                  color: completedTasks > 0 ? 'white' : '#666',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}
              />
              {completedTasks > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setShowCompleted(!showCompleted)}
                  sx={{
                    borderColor: '#ffc107',
                    color: '#ffc107',
                    fontSize: '0.7rem',
                    height: '24px',
                    minWidth: 'auto',
                    px: 1,
                    '&:hover': {
                      borderColor: '#f57c00',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)'
                    }
                  }}
                >
                  {showCompleted ? 'Hide' : 'Show'} Completed
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {tasks.length === 0 ? (
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: '#fff9c4',
            borderRadius: '16px',
            border: '1px solid #e0e0e0'
          }}>
            <TaskIcon sx={{ fontSize: 64, color: '#f57c00', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#333', mb: 1, fontWeight: 500 }}>
              No tasks yet
            </Typography>
            <Typography sx={{ color: '#666', mb: 3 }}>
              Create your first task to get started organizing your work!
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                backgroundColor: '#ffc107',
                color: '#333',
                fontWeight: 500,
                borderRadius: '8px',
                '&:hover': { backgroundColor: '#f57c00' }
              }}
            >
              Create Task
            </Button>
          </Paper>
        ) : (
          <>
            {(() => {
              // Filter tasks based on showCompleted setting
              const filteredTasks = showCompleted 
                ? tasks 
                : tasks.filter(task => {
                    const completedItems = task.checklist.filter(item => item.completed).length;
                    const totalItems = task.checklist.length;
                    return !(totalItems > 0 && completedItems === totalItems);
                  });

              if (filteredTasks.length === 0) {
                return (
                  <Paper sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: '#fff9c4',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#333', mb: 1, fontWeight: 500 }}>
                      {showCompleted ? 'All tasks completed!' : 'No pending tasks'}
                    </Typography>
                    <Typography sx={{ color: '#666', mb: 3 }}>
                      {showCompleted 
                        ? 'Great job! You\'ve completed all your tasks.' 
                        : 'All your tasks are completed. Create new ones or show completed tasks.'}
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />}
                      onClick={() => setOpenDialog(true)}
                      sx={{
                        backgroundColor: '#ffc107',
                        color: '#333',
                        fontWeight: 500,
                        borderRadius: '8px',
                        '&:hover': { backgroundColor: '#f57c00' }
                      }}
                    >
                      Create New Task
                    </Button>
                  </Paper>
                );
              }

              return (
                <Grid container spacing={2}>
                  {filteredTasks.map((task) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={task._id}>
                      <TaskCard 
                        task={task} 
                        onDelete={() => handleDeleteTask(task._id)}
                        onUpdate={(updatedTask) => handleUpdateTask(task._id, updatedTask)}
                        onToggle={() => handleToggleTask(task._id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              );
            })()}
          </>
        )}

        <Fab
          color="primary"
          aria-label="add task"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            backgroundColor: '#ffc107',
            color: '#333',
            '&:hover': { backgroundColor: '#f57c00' }
          }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            backgroundColor: '#1a1a1a', 
            color: '#ffc107',
            borderBottom: '1px solid #333'
          }}>
            Create New Task
          </DialogTitle>
          <DialogContent sx={{ 
            backgroundColor: '#1a1a1a', 
            pt: 2,
            '& .MuiTextField-root': {
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#000000',
                '& fieldset': {
                  borderColor: '#555'
                },
                '&:hover fieldset': {
                  borderColor: '#ffc107'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ffc107'
                }
              },
              '& .MuiInputLabel-root': {
                color: '#fff9c4',
                '&.Mui-focused': {
                  color: '#ffc107'
                }
              },
              '& .MuiOutlinedInput-input': {
                color: 'white'
              }
            }
          }}>
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              variant="outlined"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              sx={{ mb: 3 }}
              placeholder="What needs to be done?"
            />
            
            <Typography variant="h6" sx={{ color: '#ffc107', mb: 2 }}>
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
                  sx={{ ml: 1, color: '#f44336' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {/* Centered Add Item Button */}
            <Box display="flex" justifyContent="center" mt={2}>
              <IconButton
                onClick={addChecklistItem}
                sx={{
                  backgroundColor: '#ffc107',
                  color: '#1a1a1a',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: '#f57c00',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            backgroundColor: '#1a1a1a',
            borderTop: '1px solid #333'
          }}>
            <Button 
              onClick={() => setOpenDialog(false)} 
              sx={{ color: '#fff9c4' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask} 
              variant="contained"
              sx={{
                backgroundColor: '#ffc107',
                color: '#1a1a1a',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#f57c00' }
              }}
            >
              Create Task
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Messages */}
        <Snackbar 
          open={!!success} 
          autoHideDuration={4000} 
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setSuccess('')} 
            severity="success"
            sx={{ backgroundColor: '#4caf50' }}
          >
            {success}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={() => setError('')} 
            severity="error"
            sx={{ backgroundColor: '#f44336' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default NamespaceView; 