import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import SignaturePad from 'react-signature-pad-wrapper';
import { 
  getBriefing,
  getBriefingAttendances,
  saveAttendance,
  deleteAttendance
} from '../utils/db';
import db from '../utils/db';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';

const SignOnSheet = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [attendances, setAttendances] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [name, setName] = useState('');
  const [bac, setBAC] = useState('');
  const [error, setError] = useState('');
  const signaturePad = useRef(null);
  const containerRef = useRef(null);
  const [padHeight] = useState(200);
  const theme = useTheme();
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load briefing and attendance data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [briefingData, attendancesData] = await Promise.all([
          getBriefing(Number(id)),
          getBriefingAttendances(Number(id))
        ]);
        setBriefing(briefingData);
        setAttendances(attendancesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load briefing data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Handle window resize for signature pad
  useEffect(() => {
    const handleResize = () => {
      if (signaturePad.current && containerRef.current) {
        signaturePad.current.clear();
        signaturePad.current.resizeCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOn = async (e) => {
    e.preventDefault();
    
    if (!signaturePad.current || signaturePad.current.isEmpty()) {
      setError('Please provide a signature');
      return;
    }

    const newAttendance = {
      briefingId: Number(id),
      name,
      bac,
      timeOn: new Date().toLocaleTimeString('en-US', { hour12: true }).replace(/:\d\d /, ' '),
      signOnSignature: signaturePad.current.toDataURL()
    };

    try {
      const savedAttendance = await saveAttendance(newAttendance);
      setAttendances(prev => [...prev, savedAttendance]);
      setName('');
      setBAC('');
      signaturePad.current.clear();
      setError('');
    } catch (error) {
      console.error('Error saving attendance:', error);
      setError('Failed to save attendance');
    }
  };

  const handleSignOff = async (attendanceId) => {
    try {
      const updated = {
        ...attendances.find(att => att.id === attendanceId),
        timeOff: new Date().toLocaleTimeString('en-US', { hour12: true }).replace(/:\d\d /, ' ')
      };
      
      const savedAttendance = await saveAttendance(updated);
      setAttendances(attendances.map(att => 
        att.id === attendanceId ? savedAttendance : att
      ));
    } catch (error) {
      console.error('Error signing off:', error);
      setError('Failed to sign off');
    }
  };

  const handleEditClick = (attendee) => {
    setEditingAttendee(attendee);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (attendeeId) => {
    if (window.confirm('Are you sure you want to remove this attendee?')) {
      try {
        await deleteAttendance(attendeeId);
        const updatedAttendances = attendances.filter(a => a.id !== attendeeId);
        setAttendances(updatedAttendances);
      } catch (error) {
        console.error('Error deleting attendee:', error);
        setError('Failed to delete attendee. Please try again.');
      }
    }
  };

  const handleEditSave = async (updatedAttendee) => {
    const updatedAttendees = attendances.map(a => 
      a.id === updatedAttendee.id ? updatedAttendee : a
    );
    setAttendances(updatedAttendees);
    await saveAttendance(updatedAttendee);
    setEditDialogOpen(false);
    setEditingAttendee(null);
  };

  if (loading || !briefing) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sign-On Sheet
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {briefing.location} - {format(new Date(briefing.date), 'dd/MM/yyyy')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sign On Form */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4,
          position: 'relative',
          backgroundColor: theme.palette.mode === 'dark' ? '#0A1120' : '#fff',
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
            : 'none',
          '&::after': theme.palette.mode === 'dark' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%)',
            pointerEvents: 'none'
          } : {}
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Sign On
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              placeholder="Enter your full name"
              InputProps={{
                sx: { fontSize: '1.1rem' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="BAC Reading"
              type="number"
              inputProps={{ 
                step: 0.01,
                min: 0,
                max: 0.1
              }}
              value={bac}
              onChange={(e) => setBAC(e.target.value)}
              variant="outlined"
              placeholder="Enter BAC reading"
              InputProps={{
                sx: { fontSize: '1.1rem' }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Signature
            </Typography>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2,
                backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                '&::before': theme.palette.mode === 'dark' ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)'
                } : {}
              }}
            >
              <Box
                ref={containerRef}
                sx={{
                  width: '100%',
                  height: padHeight,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff',
                  borderRadius: theme.shape.borderRadius,
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? 'inset 0 2px 4px 0 rgb(0 0 0 / 0.4)'
                    : 'none',
                  position: 'relative',
                  '& canvas': {
                    width: '100% !important',
                    height: '100% !important'
                  },
                  '&::after': theme.palette.mode === 'dark' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)'
                  } : {}
                }}
              >
                <SignaturePad
                  ref={signaturePad}
                  options={{
                    minWidth: 1,
                    maxWidth: 2.5,
                    velocityFilterWeight: 0.5,
                    penColor: theme.palette.mode === 'dark' ? '#F1F5F9' : '#000',
                    backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff'
                  }}
                />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => signaturePad.current?.clear()}
                >
                  Clear Signature
                </Button>
                <Typography variant="body2" color="textSecondary">
                  Use your mouse or touch to sign
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSignOn}
              sx={{ 
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Sign On
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance List */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          position: 'relative',
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))'
            : 'none',
          '&::before': theme.palette.mode === 'dark' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)'
          } : {}
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Current Attendees
        </Typography>
        <Grid container spacing={3}>
          {attendances.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="textSecondary" align="center">
                No attendees have signed on yet
              </Typography>
            </Grid>
          ) : (
            attendances.map((attendee) => (
              <Grid item xs={12} key={attendee.id}>
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 3,
                    backgroundColor: theme.palette.mode === 'dark' ? 'background.elevated' : '#f8f8f8',
                    backgroundImage: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
                      : 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': theme.palette.mode === 'dark' ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 70%)',
                      pointerEvents: 'none'
                    } : {},
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': theme.palette.mode === 'dark' ? {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    } : {}
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="subtitle1">{attendee.name}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Time On: {attendee.timeOn}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        BAC: {attendee.bac}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary">
                        Time Off: {attendee.timeOff || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {!attendee.timeOff && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LogoutIcon />}
                            onClick={() => handleSignOff(attendee.id)}
                            sx={{
                              mr: 1,
                              fontSize: '0.75rem',
                              color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                              borderColor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(59, 130, 246, 0.1)' 
                                  : 'rgba(25, 118, 210, 0.04)'
                              }
                            }}
                          >
                            Sign Out
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(attendee)}
                          sx={{
                            color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(59, 130, 246, 0.1)' 
                                : 'rgba(25, 118, 210, 0.04)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(attendee.id)}
                          sx={{
                            color: theme.palette.mode === 'dark' ? 'error.light' : 'error.main',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(244, 67, 54, 0.1)'
                                : 'rgba(211, 47, 47, 0.04)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
            backgroundImage: theme.palette.mode === 'dark'
              ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
              : 'none'
          }
        }}
      >
        <DialogTitle>Edit Attendee</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editingAttendee?.name || ''}
              onChange={(e) => setEditingAttendee({ ...editingAttendee, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="BAC"
              value={editingAttendee?.bac || ''}
              onChange={(e) => setEditingAttendee({ ...editingAttendee, bac: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Time On"
              value={editingAttendee?.timeOn || ''}
              onChange={(e) => setEditingAttendee({ ...editingAttendee, timeOn: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Time Off"
              value={editingAttendee?.timeOff || ''}
              onChange={(e) => setEditingAttendee({ ...editingAttendee, timeOff: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleEditSave(editingAttendee)}
            variant="contained"
            sx={{
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
                : 'none'
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SignOnSheet;
