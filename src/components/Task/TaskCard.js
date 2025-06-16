import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
  Box,
  Chip,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

function TaskCard({ task, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState({
    title: task.title,
    checklist: task.checklist.map(item => ({ ...item }))
  });

  const handleChecklistChange = (index, completed) => {
    const updatedChecklist = [...task.checklist];
    updatedChecklist[index] = { ...updatedChecklist[index], completed };
    onUpdate({ checklist: updatedChecklist });
  };

  const handleEditOpen = () => {
    setEditTask({
      title: task.title,
      checklist: task.checklist.map(item => ({ ...item }))
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    const updatedTask = {
      title: editTask.title.trim(),
      checklist: editTask.checklist.filter(item => item.text.trim() !== '')
    };
    onUpdate(updatedTask);
    setEditOpen(false);
  };

  const handleEditCancel = () => {
    setEditOpen(false);
  };

  const updateEditChecklistItem = (index, field, value) => {
    const updatedChecklist = [...editTask.checklist];
    updatedChecklist[index] = { ...updatedChecklist[index], [field]: value };
    setEditTask({ ...editTask, checklist: updatedChecklist });
  };

  const addEditChecklistItem = () => {
    setEditTask({
      ...editTask,
      checklist: [...editTask.checklist, { text: '', completed: false }]
    });
  };

  const removeEditChecklistItem = (index) => {
    const updatedChecklist = editTask.checklist.filter((_, i) => i !== index);
    setEditTask({ ...editTask, checklist: updatedChecklist });
  };

  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const isTaskCompleted = totalItems > 0 && completedItems === totalItems;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Google Keep style colors
  const cardColors = [
    '#fff9c4', // Light yellow
    '#f8bbd9', // Light pink
    '#e1f5fe', // Light blue
    '#f3e5f5', // Light purple
    '#e8f5e8', // Light green
    '#fff3e0', // Light orange
  ];
  
  const cardColor = cardColors[Math.abs(task.title.charCodeAt(0)) % cardColors.length];

  return (
    <>
      <Card 
        elevation={1}
        sx={{ 
          minHeight: '120px',
          maxHeight: expanded ? 'none' : '200px',
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: isTaskCompleted ? '#f5f5f5' : cardColor,
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            elevation: 3,
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          opacity: isTaskCompleted ? 0.7 : 1,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography 
              variant="subtitle1" 
              component="h3" 
              sx={{ 
                textDecoration: isTaskCompleted ? 'line-through' : 'none',
                color: isTaskCompleted ? '#666' : '#333',
                fontWeight: 500,
                fontSize: '0.95rem',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                flex: 1,
                mr: 1
              }}
            >
              {task.title}
            </Typography>
            {isTaskCompleted && (
              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.2rem' }} />
            )}
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Chip 
              size="small"
              label={`${completedItems}/${totalItems}`}
              sx={{
                backgroundColor: isTaskCompleted ? '#4caf50' : '#ffc107',
                color: isTaskCompleted ? 'white' : '#333',
                fontSize: '0.7rem',
                height: '20px',
                '& .MuiChip-label': { px: 1 }
              }}
            />
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
              {formatDate(task.createdAt)}
            </Typography>
          </Box>

          <Collapse in={expanded} timeout={300}>
            <Divider sx={{ mb: 1.5, backgroundColor: '#ddd' }} />
            <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              {task.checklist.slice(0, expanded ? task.checklist.length : 3).map((item, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={item.completed}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleChecklistChange(index, e.target.checked);
                      }}
                      size="small"
                      icon={<RadioButtonUncheckedIcon sx={{ fontSize: '1.2rem', color: '#ffc107' }} />}
                      checkedIcon={<CheckCircleIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />}
                      sx={{ 
                        p: 0,
                        mr: 1
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#666' : '#333',
                        fontSize: '0.8rem',
                        lineHeight: '1.2rem',
                        wordBreak: 'break-word',
                        m: 0,
                        p: 0
                      }}
                    >
                      {item.text}
                    </Typography>
                  }
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    ml: 0,
                    mr: 0,
                    mb: 0.5,
                    width: '100%',
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      m: 0,
                      p: 0
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ))}
              {!expanded && task.checklist.length > 3 && (
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem', ml: 1 }}>
                  +{task.checklist.length - 3} more items
                </Typography>
              )}
            </Box>
          </Collapse>

          {!expanded && (
            <Box sx={{ mt: 1 }}>
              {task.checklist.slice(0, 2).map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={0.3}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: item.completed ? '#4caf50' : '#ffc107',
                      mr: 1,
                      flexShrink: 0
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontSize: '0.75rem',
                      textDecoration: item.completed ? 'line-through' : 'none',
                      opacity: item.completed ? 0.6 : 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.2
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              ))}
              {task.checklist.length > 2 && (
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem', ml: 1.75 }}>
                  +{task.checklist.length - 2} more
                </Typography>
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', p: 1, pt: 0 }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{ 
              color: '#666',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
          <Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleEditOpen();
              }}
              sx={{ color: '#666', mr: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ color: '#f44336' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardActions>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={editOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#1a1a1a', 
          color: '#ffc107',
          borderBottom: '1px solid #333'
        }}>
          Edit Task
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
            value={editTask.title}
            onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="h6" sx={{ color: '#ffc107', mb: 2 }}>
            Checklist Items
          </Typography>
          
          {editTask.checklist.map((item, index) => (
            <Box key={index} display="flex" alignItems="center" mb={2}>
              <Checkbox
                checked={item.completed}
                onChange={(e) => updateEditChecklistItem(index, 'completed', e.target.checked)}
                size="small"
                icon={<RadioButtonUncheckedIcon sx={{ fontSize: '1.2rem', color: '#ffc107' }} />}
                checkedIcon={<CheckCircleIcon sx={{ fontSize: '1.2rem', color: '#4caf50' }} />}
                sx={{
                  color: '#ffc107',
                  p: 0,
                  mr: 1,
                  '&.Mui-checked': {
                    color: '#4caf50'
                  }
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={`Item ${index + 1}`}
                value={item.text}
                onChange={(e) => updateEditChecklistItem(index, 'text', e.target.value)}
                sx={{ mr: 1 }}
              />
              <IconButton 
                onClick={() => removeEditChecklistItem(index)}
                disabled={editTask.checklist.length === 1}
                size="small"
                sx={{ color: '#f44336' }}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          {/* Centered Add Item Button */}
          <Box display="flex" justifyContent="center" mt={2}>
            <IconButton
              onClick={addEditChecklistItem}
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
            onClick={handleEditCancel}
            sx={{ color: '#fff9c4' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained"
            sx={{ 
              backgroundColor: '#ffc107',
              color: '#1a1a1a',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#f57c00' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TaskCard; 