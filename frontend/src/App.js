import React, { useMemo, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import BriefingForm from './pages/BriefingForm';
import SignOnSheet from './pages/SignOnSheet';
import ViewBriefing from './pages/ViewBriefing';
import NotFound from './pages/NotFound';

function App() {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#3B82F6' : '#1976d2',
            light: mode === 'dark' ? '#60A5FA' : '#42a5f5',
            dark: mode === 'dark' ? '#2563EB' : '#1565c0'
          },
          secondary: {
            main: mode === 'dark' ? '#EC4899' : '#dc004e',
            light: mode === 'dark' ? '#F472B6' : '#ff4081',
            dark: mode === 'dark' ? '#DB2777' : '#c51162'
          },
          background: {
            default: mode === 'dark' ? '#030712' : '#f5f5f5',
            paper: mode === 'dark' ? '#0A1120' : '#fff',
            elevated: mode === 'dark' ? '#0F172A' : '#fff'
          },
          text: {
            primary: mode === 'dark' ? '#F1F5F9' : 'rgba(0, 0, 0, 0.87)',
            secondary: mode === 'dark' ? '#94A3B8' : 'rgba(0, 0, 0, 0.6)',
            disabled: mode === 'dark' ? '#475569' : 'rgba(0, 0, 0, 0.38)'
          },
          divider: mode === 'dark' ? '#1F2937' : 'rgba(0, 0, 0, 0.12)',
          action: {
            active: mode === 'dark' ? '#F1F5F9' : 'rgba(0, 0, 0, 0.54)',
            hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)',
            selected: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
            disabled: mode === 'dark' ? '#475569' : 'rgba(0, 0, 0, 0.26)',
            disabledBackground: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.12)'
          }
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: mode === 'dark' ? '#1F2937 #030712' : undefined,
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                  backgroundColor: mode === 'dark' ? '#030712' : '#f5f5f5'
                },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                  borderRadius: 8,
                  backgroundColor: mode === 'dark' ? '#1F2937' : '#c1c1c1',
                  border: mode === 'dark' ? '1px solid #2D3748' : undefined
                }
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: 'none',
                ...(theme.palette.mode === 'dark' && {
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)',
                    pointerEvents: 'none'
                  }
                })
              })
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
                fontWeight: 500
              },
              contained: ({ theme }) => ({
                ...(theme.palette.mode === 'dark' && {
                  background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                  }
                })
              })
            }
          },
          MuiAppBar: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundColor: theme.palette.mode === 'dark' ? '#030712' : theme.palette.primary.main,
                backgroundImage: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
                  : 'none',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)'
                  : undefined
              })
            }
          },
          MuiDrawer: {
            styleOverrides: {
              paper: ({ theme }) => ({
                backgroundColor: theme.palette.mode === 'dark' ? '#0A1120' : '#fff',
                backgroundImage: theme.palette.mode === 'dark'
                  ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
                  : 'none'
              })
            }
          },
          MuiTableCell: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderBottom: `1px solid ${theme.palette.divider}`
              })
            }
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: 'none',
                ...(theme.palette.mode === 'dark' && {
                  backgroundColor: '#0A1120',
                  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)',
                    pointerEvents: 'none'
                  }
                })
              })
            }
          }
        },
        shape: {
          borderRadius: 8
        },
        shadows: [
          'none',
          '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          ...Array(19).fill('0 25px 50px -12px rgba(0, 0, 0, 0.25)')
        ]
      }),
    [mode]
  );

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header toggleColorMode={toggleColorMode} mode={mode} />
      <Container component="main" sx={{ py: 4, minHeight: 'calc(100vh - 128px)' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/briefing/new" element={<BriefingForm />} />
          <Route path="/briefing/:id" element={<ViewBriefing />} />
          <Route path="/briefing/:id/edit" element={<BriefingForm />} />
          <Route path="/briefing/:id/sign-on" element={<SignOnSheet />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Container>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
