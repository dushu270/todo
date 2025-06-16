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

  // Load namespaces
  useEffect(() => {
    loadNamespaces();
  }, []);

  const loadNamespaces = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getNamespaces();
      setNamespaces(response.data.namespaces || []);
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
      const response = await todoAPI.createNamespace({
        name: newNamespaceName.trim(),
        description: '',
        color: '#1976d2',
        icon: 'FolderIcon'
      });
      
      setNamespaces([...namespaces, response.data.namespace]);
      setNewNamespaceName('');
      setOpenDialog(false);
      setSuccess('Namespace created successfully!');
    } catch (error) {
      console.error('Error creating namespace:', error);
      setError('Failed to create namespace');
    }
  };

  const handleDeleteNamespace = async (namespaceId, event) => {
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this namespace?')) {
      return;
    }

    try {
      await todoAPI.deleteNamespace(namespaceId);
      setNamespaces(namespaces.filter(ns => ns._id !== namespaceId));
      setSuccess('Namespace deleted successfully!');
    } catch (error) {
      console.error('Error deleting namespace:', error);
      if (error.response?.status === 400) {
        setError('Cannot delete namespace with tasks. Please delete all tasks first.');
      } else {
        setError('Failed to delete namespace');
      }
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
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <FolderIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Todo App - {user.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Routes>
        <Route path="/namespace/:namespaceId" element={<NamespaceView />} />
        <Route path="/" element={
          <Container sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" component="h1">
                Your Namespaces
              </Typography>
              <Chip 
                label={`${namespaces.length} namespaces`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>
            
            {namespaces.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No namespaces yet
                </Typography>
                <Typography color="text.secondary" mb={3}>
                  Create your first namespace to organize your tasks
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Create Namespace
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {namespaces.map((namespace) => (
                  <Grid item xs={12} sm={6} md={4} key={namespace._id}>
                    <Card 
                      elevation={2}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                          elevation: 4,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                      onClick={() => handleNamespaceClick(namespace._id)}
                    >
                      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <FolderIcon 
                          sx={{ 
                            fontSize: 48, 
                            color: namespace.color || 'primary.main', 
                            mb: 2 
                          }} 
                        />
                        <Typography variant="h6" component="h2" gutterBottom>
                          {namespace.name}
                        </Typography>
                        <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <TaskIcon fontSize="small" />
                          {namespace.taskCount || 0} tasks
                        </Typography>
                        {namespace.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {namespace.description}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <IconButton 
                          color="error" 
                          onClick={(e) => handleDeleteNamespace(namespace._id, e)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            <Fab
              color="primary"
              aria-label="add namespace"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={() => setOpenDialog(true)}
            >
              <AddIcon />
            </Fab>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
              <DialogTitle>Create New Namespace</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Namespace Name"
                  fullWidth
                  variant="outlined"
                  value={newNamespaceName}
                  onChange={(e) => setNewNamespaceName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNamespace();
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateNamespace} variant="contained">Create</Button>
              </DialogActions>
            </Dialog>
          </Container>
        } />
      </Routes>

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
    </>
  );
}

export default Dashboard; 