import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { saveBriefing, getBriefing, getAllProjects, getUsersByRole, getBriefingAttendances, saveAttendance } from '../utils/db';

const BriefingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [attendances, setAttendances] = useState([]);
  
  const [briefing, setBriefing] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: true }).replace(/:\d\d /, ' '),
    location: '',
    projectManager: '',
    supervisor: '',
    weather: '',
    uvIndex: '',
    temperature: '',
    communication: {
      siteNotices: '',
      visitors: '',
      newStarters: '',
      daaTesting: false,
      peopleFlying: {
        in: '',
        out: ''
      }
    },
    hseIssues: {
      hazards: '',
      incidents: '',
      injuries: '',
      take5Count: 0,
      jhaCount: 0,
      otherIssues: ''
    },
    safetyTopics: [],
    permits: [],
    workCrewInteractions: '',
    scopeOfWorks: [],
    additionalInfo: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          const existingBriefing = await getBriefing(Number(id));
          if (existingBriefing) {
            setBriefing(existingBriefing);
            
            // Load attendances for this briefing
            const briefingAttendances = await getBriefingAttendances(Number(id));
            setAttendances(briefingAttendances || []);
            console.log('Loaded attendances:', briefingAttendances);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = (section, field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setBriefing(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && field
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleNestedInputChange = (section, subsection, field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setBriefing(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayUpdate = (field, operation, index) => {
    if (operation === 'add') {
      const value = prompt(`Enter new ${field.slice(0, -1)}:`);
      if (value) {
        setBriefing(prev => ({
          ...prev,
          [field]: [...prev[field], value]
        }));
      }
    } else if (operation === 'edit') {
      const currentValue = briefing[field][index];
      const newValue = prompt(`Edit ${field.slice(0, -1)}:`, currentValue);
      if (newValue && newValue !== currentValue) {
        setBriefing(prev => ({
          ...prev,
          [field]: prev[field].map((item, i) => i === index ? newValue : item)
        }));
      }
    } else if (operation === 'delete') {
      setBriefing(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSignOut = async (attendanceId) => {
    try {
      const timeOff = new Date().toLocaleTimeString('en-US', { hour12: true }).replace(/:\d\d /, ' ');
      
      // Get the current attendance record
      const attendance = attendances.find(att => att.id === attendanceId);
      if (!attendance) return;
      
      // Update attendance in the database
      const updatedAttendance = { ...attendance, timeOff };
      await saveAttendance(updatedAttendance);
      
      // Update local state
      setAttendances(prev => prev.map(att => 
        att.id === attendanceId ? { ...att, timeOff } : att
      ));
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const savedId = await saveBriefing(briefing);
      navigate(`/briefing/${savedId}`);
    } catch (error) {
      console.error('Error saving briefing:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="form" onSubmit={handleSubmit} sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">
          {id ? 'Edit Briefing' : 'New Briefing'}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Save Briefing
          </Button>
        </Box>
      </Box>

      {/* Header Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Header Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={briefing.date}
              onChange={handleInputChange('date')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={briefing.time}
              onChange={handleInputChange('time')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Location"
              value={briefing.location}
              onChange={handleInputChange('location')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project Manager"
              value={briefing.projectManager}
              onChange={handleInputChange('projectManager')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Supervisor"
              value={briefing.supervisor}
              onChange={handleInputChange('supervisor')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Weather"
              value={briefing.weather}
              onChange={handleInputChange('weather')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="UV Index"
              value={briefing.uvIndex}
              onChange={handleInputChange('uvIndex')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Temperature"
              value={briefing.temperature}
              onChange={handleInputChange('temperature')}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Communication */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Communication</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Site Notices"
              value={briefing.communication.siteNotices}
              onChange={handleInputChange('communication', 'siteNotices')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Visitors"
              value={briefing.communication.visitors}
              onChange={handleInputChange('communication', 'visitors')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="New Starters"
              value={briefing.communication.newStarters}
              onChange={handleInputChange('communication', 'newStarters')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={briefing.communication.daaTesting}
                  onChange={handleInputChange('communication', 'daaTesting')}
                />
              }
              label="D&A Testing Required"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="People Flying In"
                  value={briefing.communication.peopleFlying.in}
                  onChange={handleNestedInputChange('communication', 'peopleFlying', 'in')}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="People Flying Out"
                  value={briefing.communication.peopleFlying.out}
                  onChange={handleNestedInputChange('communication', 'peopleFlying', 'out')}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* HSE Issues */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>HSE Issues</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Hazards"
              value={briefing.hseIssues.hazards}
              onChange={handleInputChange('hseIssues', 'hazards')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Incidents"
              value={briefing.hseIssues.incidents}
              onChange={handleInputChange('hseIssues', 'incidents')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Injuries"
              value={briefing.hseIssues.injuries}
              onChange={handleInputChange('hseIssues', 'injuries')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Take 5 Count"
              value={briefing.hseIssues.take5Count}
              onChange={handleInputChange('hseIssues', 'take5Count')}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="JHA Count"
              value={briefing.hseIssues.jhaCount}
              onChange={handleInputChange('hseIssues', 'jhaCount')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Other Issues"
              value={briefing.hseIssues.otherIssues}
              onChange={handleInputChange('hseIssues', 'otherIssues')}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Safety Topics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Safety Topics</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleArrayUpdate('safetyTopics', 'add')}
          >
            Add Topic
          </Button>
        </Box>
        <List>
          {briefing.safetyTopics.map((topic, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => handleArrayUpdate('safetyTopics', 'edit', index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleArrayUpdate('safetyTopics', 'delete', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={`${index + 1}. ${topic}`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Permits Required */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Permits Required</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleArrayUpdate('permits', 'add')}
          >
            Add Permit
          </Button>
        </Box>
        <List>
          {briefing.permits.map((permit, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => handleArrayUpdate('permits', 'edit', index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleArrayUpdate('permits', 'delete', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={permit} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Work Crew Interactions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Work Crew Interactions</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={briefing.workCrewInteractions}
          onChange={handleInputChange('workCrewInteractions')}
          placeholder="Describe any interactions between work crews and work areas..."
        />
      </Paper>

      {/* Scope of Works */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Scope of Works</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleArrayUpdate('scopeOfWorks', 'add')}
          >
            Add Work Item
          </Button>
        </Box>
        <List>
          {briefing.scopeOfWorks.map((work, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => handleArrayUpdate('scopeOfWorks', 'edit', index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleArrayUpdate('scopeOfWorks', 'delete', index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={`${index + 1}. ${work}`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Attendees */}
      {id && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Attendees</Typography>
          {attendances.length === 0 ? (
            <Typography variant="body1">No attendees recorded for this briefing.</Typography>
          ) : (
            <List>
              {attendances.map((attendee) => (
                <ListItem 
                  key={attendee.id} 
                  secondaryAction={
                    !attendee.timeOff && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSignOut(attendee.id)}
                      >
                        Sign Out
                      </Button>
                    )
                  }
                >
                  <ListItemText
                    primary={attendee.name}
                    secondary={
                      <>
                        Time On: {attendee.timeOn || 'N/A'} | BAC: {attendee.bac || 'N/A'}
                        {attendee.timeOff && <> | Time Off: {attendee.timeOff}</>}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Additional Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Additional Information</Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={briefing.additionalInfo}
          onChange={handleInputChange('additionalInfo')}
          placeholder="Any additional information or notes..."
        />
      </Paper>

      {/* Bottom Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
        >
          Save Briefing
        </Button>
      </Box>
    </Container>
  );
};

export default BriefingForm;
