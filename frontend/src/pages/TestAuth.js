import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useAuth } from '../contexts/AuthContext';
import { runAllTests, testAuthFlow, testRBAC } from '../utils/authTestHarness';

const TestAuth = () => {
  const { 
    currentUser, 
    isAuthenticated, 
    isProjectManager, 
    isSiteSupervisor,
    resetDatabase 
  } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Capture console logs for test results
  useEffect(() => {
    // Save original console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      group: console.group,
      groupEnd: console.groupEnd
    };
    
    // Override console methods to capture logs
    console.log = (...args) => {
      setTestResults(prev => [...prev, { type: 'log', content: args.join(' ') }]);
      originalConsole.log(...args);
    };
    
    console.error = (...args) => {
      setTestResults(prev => [...prev, { type: 'error', content: args.join(' ') }]);
      originalConsole.error(...args);
    };
    
    console.warn = (...args) => {
      setTestResults(prev => [...prev, { type: 'warn', content: args.join(' ') }]);
      originalConsole.warn(...args);
    };
    
    console.info = (...args) => {
      setTestResults(prev => [...prev, { type: 'info', content: args.join(' ') }]);
      originalConsole.info(...args);
    };
    
    console.group = (...args) => {
      setTestResults(prev => [...prev, { type: 'group', content: args.join(' ') }]);
      originalConsole.group(...args);
    };
    
    console.groupEnd = () => {
      setTestResults(prev => [...prev, { type: 'groupEnd', content: '' }]);
      originalConsole.groupEnd();
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.group = originalConsole.group;
      console.groupEnd = originalConsole.groupEnd;
    };
  }, []);
  
  // Run all tests
  const handleRunAllTests = async () => {
    setTestResults([]);
    setIsRunningTests(true);
    
    try {
      await runAllTests();
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  // Run auth flow test
  const handleAuthFlowTest = async () => {
    setTestResults([]);
    setIsRunningTests(true);
    
    try {
      await testAuthFlow();
    } catch (error) {
      console.error('Auth flow test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  const handleRBACTest = () => {
    setTestResults([]);
    setIsRunningTests(true);
    
    try {
      testRBAC();
    } catch (error) {
      console.error('RBAC test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  const handleReset = async () => {
    try {
      await resetDatabase();
      setTestResults([]);
    } catch (error) {
      console.error('Failed to reset database:', error);
    }
  };
  
  // Render test result log with styling
  const renderTestResult = (result, index) => {
    // Style based on log type
    let style = {};
    let icon = null;
    
    switch (result.type) {
      case 'error':
        style = { color: 'error.main', fontWeight: 'bold' };
        icon = <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />;
        break;
      case 'warn':
        style = { color: 'warning.main' };
        icon = <ErrorIcon color="warning" fontSize="small" sx={{ mr: 1 }} />;
        break;
      case 'group':
        style = { fontWeight: 'bold', mt: 1 };
        break;
      case 'groupEnd':
        return <Divider key={index} sx={{ my: 1 }} />;
      default:
        style = {};
        break;
    }
    
    // Check for success/failure messages
    if (result.content.includes('✅')) {
      icon = <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />;
      style.color = 'success.main';
      style.fontWeight = 'bold';
    } else if (result.content.includes('❌')) {
      icon = <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />;
      style.color = 'error.main';
      style.fontWeight = 'bold';
    }
    
    return (
      <ListItem key={index} sx={{ py: 0.5, ...style }}>
        <Box display="flex" alignItems="center" width="100%">
          {icon}
          <ListItemText primary={result.content} />
        </Box>
      </ListItem>
    );
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Authentication System Test
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            This page allows you to test the authentication system functionality.
            Use the buttons below to run different test scenarios.
          </Typography>
        </Alert>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Authentication Status
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </Typography>
            
            {currentUser && (
              <>
                <Typography variant="body1" gutterBottom>
                  <strong>User:</strong> {currentUser.name} ({currentUser.email})
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Role:</strong> {currentUser.role === 'project_manager' ? 'Project Manager' : 'Site Supervisor'}
                </Typography>
                <Typography variant="body1">
                  <strong>Permissions:</strong>
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body2">
                    - Is Project Manager: {isProjectManager ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">
                    - Is Site Supervisor: {isSiteSupervisor ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRunAllTests}
            disabled={isRunningTests}
          >
            Run All Tests
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleAuthFlowTest}
            disabled={isRunningTests}
          >
            Test Auth Flow
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleRBACTest}
            disabled={isRunningTests}
          >
            Test RBAC
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleReset}
          >
            Reset Database
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Test Credentials:</Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Project Manager:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Email: hermmy@example.com
            </Typography>
            <Typography variant="body1" gutterBottom>
              Password: password123
            </Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Site Supervisor:</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Email: andrew@example.com
            </Typography>
            <Typography variant="body1" gutterBottom>
              Password: password123
            </Typography>
          </Box>
        </Box>
        
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Test Results</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {testResults.length > 0 ? (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  maxHeight: 400, 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  bgcolor: 'background.default'
                }}
              >
                <List dense disablePadding>
                  {testResults.map(renderTestResult)}
                </List>
              </Paper>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No test results yet. Run a test to see output here.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default TestAuth;
