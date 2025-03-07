import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import { format } from 'date-fns';
import { getAllBriefings } from '../utils/db';

const Dashboard = () => {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('Error loading briefings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBriefings();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/briefing/new"
        >
          New Briefing
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : briefings.length === 0 ? (
        <Card sx={{ mb: 4, p: 2, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No briefings found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your first briefing to get started
            </Typography>
          </CardContent>
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
        </Card>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Recent Briefings
          </Typography>
          <Grid container spacing={3}>
            {briefings.map((briefing) => (
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
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
