import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser, logout, updateProfile, updatePassword, error: authError } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Initialize form data from current user
  useEffect(() => {
    if (currentUser) {
      setUserData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || '',
        company: currentUser.company || '',
      }));
    }
  }, [currentUser]);
  
  // Set error from context if present
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  // Get role label for display
  const getRoleLabel = (role) => {
    switch (role) {
      case 'project_manager':
        return 'Project Manager';
      case 'site_supervisor':
        return 'Site Supervisor';
      default:
        return role;
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError('');
    setSuccess('');
    
    // Reset form if canceling edit
    if (editMode) {
      setUserData(prev => ({
        ...prev,
        name: currentUser?.name || '',
        company: currentUser?.company || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };
  
  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password update if attempting to change password
    if (userData.newPassword) {
      if (!userData.currentPassword) {
        setError('Current password is required to set a new password');
        return;
      }
      
      if (userData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      
      if (userData.newPassword !== userData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Update profile information (name, company, etc.)
      const profileData = {
        name: userData.name,
        company: userData.company
      };
      
      await updateProfile(profileData);
      
      // Update password if provided
      if (userData.newPassword) {
        await updatePassword(userData.currentPassword, userData.newPassword);
        
        // If password was changed, notify user they'll be logged out
        setSuccess('Profile updated successfully. You will be logged out in 3 seconds.');
        
        // Log the user out after 3 seconds
        setTimeout(() => {
          logout();
        }, 3000);
      } else {
        setSuccess('Profile updated successfully');
      }
      
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              mr: 2
            }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {currentUser.name}
            </Typography>
            <Chip
              label={getRoleLabel(currentUser.role)}
              color={currentUser.role === 'project_manager' ? 'primary' : 'secondary'}
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Account Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={handleChange}
                disabled={!editMode || isSubmitting}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={userData.email}
                disabled={true} // Email cannot be changed
                helperText="Email address cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={userData.company}
                onChange={handleChange}
                disabled={!editMode || isSubmitting}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                value={getRoleLabel(currentUser.role)}
                disabled={true}
                helperText="Contact administrator to change role"
              />
            </Grid>
            
            {editMode && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Change Password
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Leave blank if you don't want to change your password.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={userData.currentPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={userData.newPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    helperText="Minimum 6 characters"
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
              </>
            )}
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {editMode ? (
              <>
                <Button 
                  variant="outlined" 
                  onClick={toggleEditMode}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                onClick={toggleEditMode}
                startIcon={<AccountCircleIcon />}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
