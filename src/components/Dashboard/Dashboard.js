import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { todoAPI } from '../../services/api';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  Task as TaskIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import NamespaceView from './NamespaceView';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [namespaces, setNamespaces] = useState([]);
  const [namespaceTasks, setNamespaceTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNamespaceName, setNewNamespaceName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register user with backend on first load
  useEffect(() => {
    const registerUser = async () => {
      try {
        await todoAPI.registerUser();
      } catch (error) {
        console.error('User registration error:', error);
      }
    };

    if (user) {
      registerUser();
    }
  }, [user]);

  // Load namespaces and their task counts
  useEffect(() => {
    loadNamespacesAndTasks();
  }, []);

  const loadNamespacesAndTasks = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getNamespaces();
      const namespacesData = response.data.namespaces || [];
      setNamespaces(namespacesData);
      
      // Load task counts for each namespace
      const taskCounts = {};
      for (const namespace of namespacesData) {
        try {
          const tasksResponse = await todoAPI.getTasks({ namespaceId: namespace._id });
          const tasks = tasksResponse.data.tasks || [];
          taskCounts[namespace._id] = {
            total: tasks.length,
            completed: tasks.filter(task => {
              // Check if task is completed based on checklist completion
              const completedItems = task.checklist.filter(item => item.completed).length;
              const totalItems = task.checklist.length;
              return totalItems > 0 && completedItems === totalItems;
            }).length
          };
        } catch (error) {
          console.error(`Error loading tasks for namespace ${namespace._id}:`, error);
          taskCounts[namespace._id] = { total: 0, completed: 0 };
        }
      }
      setNamespaceTasks(taskCounts);
    } catch (error) {
      console.error('Error loading namespaces:', error);
      setError('Failed to load namespaces');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateNamespace = async () => {
    if (!newNamespaceName.trim()) return;

    try {
      const response = await todoAPI.createNamespace({ name: newNamespaceName.trim() });
      setNamespaces([...namespaces, response.data.namespace]);
      setNewNamespaceName('');
      setOpenDialog(false);
      setSuccess('Workspace created successfully!');
      // Reload to get task counts
      loadNamespacesAndTasks();
    } catch (error) {
      console.error('Error creating namespace:', error);
      setError('Failed to create workspace');
    }
  };

  const handleDeleteNamespace = async (namespaceId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this workspace? All tasks will be deleted.')) {
      return;
    }

    try {
      await todoAPI.deleteNamespace(namespaceId);
      setNamespaces(namespaces.filter(ns => ns._id !== namespaceId));
      setSuccess('Workspace deleted successfully!');
      // Reload to update task counts
      loadNamespacesAndTasks();
    } catch (error) {
      console.error('Error deleting namespace:', error);
      setError('Failed to delete workspace');
    }
  };

  const handleNamespaceClick = (namespaceId) => {
    navigate(`/dashboard/namespace/${namespaceId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffc107' }}>
        <Toolbar>
          <FolderIcon sx={{ mr: 2, color: '#333' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#333', fontWeight: 500 }}>
            Todo App - {user.email}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout} 
            startIcon={<LogoutIcon />}
            sx={{ 
              color: '#333',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Routes>
        <Route path="/namespace/:namespaceId" element={<NamespaceView />} />
        <Route path="/" element={
          <Container sx={{ mt: 3, mb: 4, backgroundColor: '#1a1a1a', minHeight: '100vh', pt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                              <Typography variant="h4" component="h1" sx={{ color: '#ffc107', fontWeight: 500 }}>
                  Your Workspaces
                </Typography>
              <Chip 
                label={`${namespaces.length} workspaces`} 
                sx={{
                  backgroundColor: '#fff9c4',
                  color: '#333',
                  fontWeight: 500
                }}
              />
            </Box>
            
            {namespaces.length === 0 ? (
              <Paper sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: '#fff9c4',
                borderRadius: '16px',
                border: '1px solid #e0e0e0'
              }}>
                <FolderIcon sx={{ fontSize: 64, color: '#f57c00', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#333', mb: 1, fontWeight: 500 }}>
                  No workspaces yet
                </Typography>
                <Typography sx={{ color: '#666', mb: 3 }}>
                  Create your first workspace to organize your daily tasks
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
                  Create Workspace
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {namespaces.map((namespace) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={namespace._id}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        minHeight: '120px',
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        backgroundColor: '#fff9c4',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                      onClick={() => handleNamespaceClick(namespace._id)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ 
                              color: '#333',
                              fontWeight: 500,
                              fontSize: '1.1rem',
                              wordBreak: 'break-word',
                              flex: 1
                            }}
                          >
                            {namespace.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(event) => handleDeleteNamespace(namespace._id, event)}
                            sx={{ 
                              color: '#f44336',
                              ml: 1,
                              '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {namespace.description && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#666',
                              fontSize: '0.85rem',
                              mb: 1
                            }}
                          >
                            {namespace.description}
                          </Typography>
                        )}
                        
                        <Box display="flex" alignItems="center" mt="auto">
                          <Chip
                            icon={<TaskIcon />}
                            label={`${namespaceTasks[namespace._id]?.total || 0} tasks`}
                            size="small"
                            sx={{
                              backgroundColor: '#f57c00',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: '24px'
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Fab
              color="primary"
              aria-label="add namespace"
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ 
                backgroundColor: '#1a1a1a', 
                color: '#ffc107',
                borderBottom: '1px solid #333'
              }}>
                Create New Workspace
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
                  label="Workspace Name"
                  fullWidth
                  variant="outlined"
                  value={newNamespaceName}
                  onChange={(e) => setNewNamespaceName(e.target.value)}
                  placeholder="e.g., Work, Personal, Home"
                />
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
                  onClick={handleCreateNamespace} 
                  variant="contained"
                  sx={{
                    backgroundColor: '#ffc107',
                    color: '#1a1a1a',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#f57c00' }
                  }}
                >
                  Create
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
        } />
      </Routes>
    </>
  );
}

export default Dashboard; 