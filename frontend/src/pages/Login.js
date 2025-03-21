import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Paper,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      console.log('Attempting login with:', { email, password });
      const result = await loginUser(email, password);
      console.log('Login result:', result);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Don't have an account? Register
              </Typography>
            </Link>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3, width: '100%' }} />
        
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Sample Login Credentials
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 2, width: '100%' }}>
          <CardContent>
            <Typography variant="subtitle1">Project Manager:</Typography>
            <Typography variant="body2">Email: hermmy@example.com</Typography>
            <Typography variant="body2">Password: password123</Typography>
          </CardContent>
        </Card>
        
        <Card variant="outlined" sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="subtitle1">Site Supervisor:</Typography>
            <Typography variant="body2">Email: andrew@example.com</Typography>
            <Typography variant="body2">Password: password123</Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
