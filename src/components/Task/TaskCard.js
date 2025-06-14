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
  const [expanded, setExpanded] = useState(true);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card 
        elevation={2}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          opacity: isTaskCompleted ? 0.8 : 1,
          border: isTaskCompleted ? '2px solid #4caf50' : 'none'
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                textDecoration: isTaskCompleted ? 'line-through' : 'none',
                color: isTaskCompleted ? 'text.secondary' : 'text.primary',
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </Typography>
            {isTaskCompleted && (
              <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} />
            )}
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Chip 
              size="small"
              label={`${completedItems}/${totalItems} completed`}
              color={isTaskCompleted ? 'success' : 'primary'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {formatDate(task.createdAt)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Checklist ({completionPercentage}%)
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {task.checklist.map((item, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={item.completed}
                      onChange={(e) => handleChecklistChange(index, e.target.checked)}
                      size="small"
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'text.secondary' : 'text.primary',
                        wordBreak: 'break-word'
                      }}
                    >
                      {item.text}
                    </Typography>
                  }
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    ml: 0,
                    mb: 0.5,
                    width: '100%'
                  }}
                />
              ))}
            </Box>
          </Collapse>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
          <Box>
            <IconButton size="small" color="primary" onClick={handleEditOpen}>
              <EditIcon />
            </IconButton>
          </Box>
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={editOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
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
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Checklist Items
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addEditChecklistItem}
              variant="outlined"
              size="small"
            >
              Add Item
            </Button>
          </Box>
          
          {editTask.checklist.map((item, index) => (
            <Box key={index} display="flex" alignItems="center" mb={2}>
              <Checkbox
                checked={item.completed}
                onChange={(e) => updateEditChecklistItem(index, 'completed', e.target.checked)}
                size="small"
              />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={`Item ${index + 1}`}
                value={item.text}
                onChange={(e) => updateEditChecklistItem(index, 'text', e.target.value)}
                sx={{ mx: 1 }}
              />
              <IconButton 
                onClick={() => removeEditChecklistItem(index)}
                disabled={editTask.checklist.length === 1}
                size="small"
                color="error"
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TaskCard; 