import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as SignUpIcon, Task as TaskIcon } from '@mui/icons-material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tabValue === 1) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a', // Dark black background
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            backgroundColor: '#2d2d2d', // Dark gray for the card
            borderRadius: '16px',
            border: '2px solid #ffc107' // Yellow border
          }}
        >
          {/* App Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <TaskIcon sx={{ fontSize: 64, color: '#ffc107', mb: 2 }} />
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                color: '#ffc107', 
                fontWeight: 600,
                mb: 1
              }}
            >
              Todo App
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#fff9c4', 
                fontWeight: 300,
                opacity: 0.9
              }}
            >
              Organize your daily tasks beautifully
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3, backgroundColor: '#ffc107', opacity: 0.3 }} />
          
          {/* Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                color: '#fff9c4',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#ffc107'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#ffc107',
                height: 3
              }
            }}
          >
            <Tab icon={<LoginIcon />} label="Sign In" />
            <Tab icon={<SignUpIcon />} label="Sign Up" />
          </Tabs>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2, 
                mb: 2,
                backgroundColor: '#d32f2f',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white'
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1a1a',
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
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1a1a',
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
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  backgroundColor: '#ffc107',
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  py: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#f57c00',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                  },
                  '&:disabled': {
                    backgroundColor: '#555',
                    color: '#999'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                disabled={loading}
                startIcon={<LoginIcon />}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1a1a',
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
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="new-password"
                helperText="Minimum 6 characters"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1a1a',
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
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#fff9c4',
                    opacity: 0.7
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  backgroundColor: '#ffc107',
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  py: 1.5,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: '#f57c00',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                  },
                  '&:disabled': {
                    backgroundColor: '#555',
                    color: '#999'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                disabled={loading}
                startIcon={<SignUpIcon />}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabPanel>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #555' }}>
            <Typography variant="caption" sx={{ color: '#fff9c4', opacity: 0.6 }}>
              Secure authentication powered by Firebase
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 