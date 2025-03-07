import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{
        py: 3,
        backgroundColor: theme.palette.mode === 'dark' ? '#0A1120' : '#f5f5f5',
        borderTop: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        '&::before': theme.palette.mode === 'dark' ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)'
        } : {}
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
        >
          {currentYear} Site Pre-Start App. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
