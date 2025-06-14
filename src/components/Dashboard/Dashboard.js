import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
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
  Chip
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
  const [namespaces, setNamespaces] = useState([
    { id: '1', name: 'Office', taskCount: 0 },
    { id: '2', name: 'Home', taskCount: 0 },
    { id: '3', name: 'Personal', taskCount: 0 }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNamespaceName, setNewNamespaceName] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateNamespace = () => {
    if (newNamespaceName.trim()) {
      const newNamespace = {
        id: Date.now().toString(),
        name: newNamespaceName.trim(),
        taskCount: 0
      };
      setNamespaces([...namespaces, newNamespace]);
      setNewNamespaceName('');
      setOpenDialog(false);
    }
  };

  const handleDeleteNamespace = (namespaceId) => {
    setNamespaces(namespaces.filter(ns => ns.id !== namespaceId));
  };

  const handleNamespaceClick = (namespaceId) => {
    navigate(`/dashboard/namespace/${namespaceId}`);
  };

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
            
            <Grid container spacing={3}>
              {namespaces.map((namespace) => (
                <Grid item xs={12} sm={6} md={4} key={namespace.id}>
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
                    onClick={() => handleNamespaceClick(namespace.id)}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <FolderIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" component="h2" gutterBottom>
                        {namespace.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <TaskIcon fontSize="small" />
                        {namespace.taskCount} tasks
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <IconButton 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNamespace(namespace.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

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
    </>
  );
}

export default Dashboard; 