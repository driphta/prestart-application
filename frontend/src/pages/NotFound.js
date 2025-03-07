import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Container sx={{ textAlign: 'center', pt: 4 }}>
      <Typography variant="h3">404 - Page Not Found</Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>
        Return to Dashboard
      </Button>
    </Container>
  );
}
