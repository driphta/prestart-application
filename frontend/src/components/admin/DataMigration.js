import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  AlertTitle, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { migrateDataToAzure } from '../../utils/migrateData';

const DataMigration = () => {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleMigration = async () => {
    try {
      setMigrating(true);
      setError(null);
      setResult(null);
      
      const migrationResult = await migrateDataToAzure();
      setResult(migrationResult);
      
      if (!migrationResult.success) {
        setError(migrationResult.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during migration');
      console.error('Migration error:', err);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Data Migration to Azure
      </Typography>
      
      <Typography variant="body1" paragraph>
        This tool will migrate your local data from browser storage to Azure Cosmos DB.
        Make sure your backend API is properly configured before proceeding.
      </Typography>
      
      <Typography variant="body2" paragraph color="text.secondary">
        Note: This process may take some time depending on the amount of data. Do not close the browser during migration.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {result && result.success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Success</AlertTitle>
          {result.message}
          
          {result.results && (
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={`Users: ${result.results.users.success}/${result.results.users.total} migrated`} 
                  secondary={result.results.users.failed > 0 ? `${result.results.users.failed} failed` : null}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary={`Projects: ${result.results.projects.success}/${result.results.projects.total} migrated`} 
                  secondary={result.results.projects.failed > 0 ? `${result.results.projects.failed} failed` : null}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary={`Briefings: ${result.results.briefings.success}/${result.results.briefings.total} migrated`} 
                  secondary={result.results.briefings.failed > 0 ? `${result.results.briefings.failed} failed` : null}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary={`Attendances: ${result.results.attendances.success}/${result.results.attendances.total} migrated`} 
                  secondary={result.results.attendances.failed > 0 ? `${result.results.attendances.failed} failed` : null}
                />
              </ListItem>
            </List>
          )}
        </Alert>
      )}
      
      {result && !result.success && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Migration Failed</AlertTitle>
          {result.message}
        </Alert>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleMigration}
          disabled={migrating}
          startIcon={migrating ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {migrating ? 'Migrating...' : 'Start Migration'}
        </Button>
      </Box>
    </Paper>
  );
};

export default DataMigration;
