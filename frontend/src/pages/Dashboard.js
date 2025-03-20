import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  Alert,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { format } from 'date-fns';
import { getAllBriefings } from '../utils/db';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [briefings, setBriefings] = useState([]);
  const [filteredBriefings, setFilteredBriefings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { currentUser, isAuthenticated, isProjectManager, isSiteSupervisor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBriefings = async () => {
      try {
        const data = await getAllBriefings();
        // Sort by date, most recent first
        const sortedData = data.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB - dateA;
        });
        setBriefings(sortedData);
        
        // Filter briefings based on user role
        filterBriefingsForUser(sortedData);
      } catch (error) {
        console.error('Error loading briefings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBriefings();
  }, [isAuthenticated, currentUser]);

  // Filter briefings based on user role and search term
  const filterBriefingsForUser = (allBriefings) => {
    if (!isAuthenticated) {
      // Not authenticated, show limited briefings or prompt to login
      setFilteredBriefings([]);
      return;
    }

    let filtered = allBriefings;
    
    // If site supervisor, show only their briefings
    if (isSiteSupervisor && !isProjectManager) {
      filtered = allBriefings.filter(
        briefing => briefing.supervisorId === currentUser.id
      );
    }

    // Apply search filter if any
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        briefing => 
          briefing.location.toLowerCase().includes(term) ||
          briefing.supervisor.toLowerCase().includes(term) ||
          briefing.projectManager.toLowerCase().includes(term)
      );
    }

    // Apply tab filtering
    if (activeTab === 1) { // Today's briefings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(briefing => {
        const briefingDate = new Date(briefing.date);
        briefingDate.setHours(0, 0, 0, 0);
        return briefingDate.getTime() === today.getTime();
      });
    } else if (activeTab === 2) { // This week's briefings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      filtered = filtered.filter(briefing => {
        const briefingDate = new Date(briefing.date);
        briefingDate.setHours(0, 0, 0, 0);
        return briefingDate >= startOfWeek && briefingDate <= endOfWeek;
      });
    }

    setFilteredBriefings(filtered);
  };

  // Apply filtering when search term or tab changes
  useEffect(() => {
    filterBriefingsForUser(briefings);
  }, [searchTerm, activeTab]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Render dashboard for unauthenticated users
  const renderUnauthenticatedDashboard = () => (
    <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome to Site Pre-Start Application
      </Typography>
      <Typography paragraph>
        Log in or register to access briefings and site information.
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<LoginIcon />}
          component={RouterLink}
          to="/login"
          sx={{ mr: 2 }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          startIcon={<HowToRegIcon />}
          component={RouterLink}
          to="/register"
        >
          Register
        </Button>
      </Box>
    </Paper>
  );

  // Render dashboard content based on authentication status
  const renderDashboardContent = () => {
    if (!isAuthenticated) {
      return renderUnauthenticatedDashboard();
    }

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <>
        {/* Search and filter controls */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search briefings by location, supervisor, or project manager"
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Briefings" />
            <Tab label="Today" />
            <Tab label="This Week" />
          </Tabs>
        </Box>

        {filteredBriefings.length === 0 ? (
          <Card sx={{ mb: 4, p: 2, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No briefings found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchTerm 
                  ? "No results match your search criteria" 
                  : isSiteSupervisor 
                    ? "Create your first briefing to get started" 
                    : "No briefings are available for viewing"}
              </Typography>
            </CardContent>
            {isSiteSupervisor && (
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/briefing/new"
                >
                  Create Briefing
                </Button>
              </CardActions>
            )}
          </Card>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              {activeTab === 0 
                ? 'All Briefings' 
                : activeTab === 1 
                  ? "Today's Briefings" 
                  : "This Week's Briefings"}
              <Chip 
                label={`${filteredBriefings.length} ${filteredBriefings.length === 1 ? 'briefing' : 'briefings'}`} 
                size="small" 
                sx={{ ml: 1 }} 
              />
            </Typography>
            <Grid container spacing={3}>
              {filteredBriefings.map((briefing) => (
                <Grid item xs={12} sm={6} md={4} key={briefing.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {briefing.location}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {formatDate(briefing.date)} - {briefing.time}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>Supervisor:</strong> {briefing.supervisor}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Project Manager:</strong> {briefing.projectManager}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          size="small" 
                          label={`UV: ${briefing.uvIndex || 'N/A'}`} 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                        <Chip 
                          size="small" 
                          label={`Temp: ${briefing.temperature || 'N/A'}`} 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<DescriptionIcon />}
                        component={RouterLink}
                        to={`/briefing/${briefing.id}`}
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<PeopleIcon />}
                        component={RouterLink}
                        to={`/briefing/${briefing.id}/sign-on`}
                      >
                        Sign-On
                      </Button>
                      {isSiteSupervisor && briefing.supervisorId === currentUser.id && (
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          component={RouterLink}
                          to={`/briefing/${briefing.id}/edit`}
                        >
                          Edit
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        {isAuthenticated && isSiteSupervisor && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/briefing/new"
          >
            New Briefing
          </Button>
        )}
      </Box>

      {renderDashboardContent()}
    </Box>
  );
};

export default Dashboard;
