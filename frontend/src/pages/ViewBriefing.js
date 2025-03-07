import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { getBriefing, getBriefingAttendances, saveAttendance } from '../utils/db';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// Corporate styling constants
const COMPANY_LOGO_URL = '/aqura-logo.png';
const COMPANY_NAME = 'Aqura Technologies';
const COMPANY_ADDRESS = 'Level 10, 3 Hasler Road\nOsborne Park, WA, 6107';
const PDF_WATERMARK = '';

// Brand colors
const BRAND_PRIMARY = '#1E3A8A';
const BRAND_SECONDARY = '#DC2626';
const BRAND_PRIMARY_RGB = [30, 58, 138]; // RGB values for #1E3A8A

// Function to ensure signatures are visible on light background
const processSignatureForPdf = (signatureDataUrl) => {
  // For now, we'll just return the original signature
  // In a more advanced implementation, this could convert dark mode signatures
  // to be visible on light backgrounds using canvas manipulation
  return signatureDataUrl;
};

const ViewBriefing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [briefingData, attendancesData] = await Promise.all([
          getBriefing(Number(id)),
          getBriefingAttendances(Number(id))
        ]);
        
        // Ensure briefing data has all required fields
        if (briefingData) {
          briefingData.communication = briefingData.communication || {};
          briefingData.hseIssues = briefingData.hseIssues || {};
          briefingData.permits = briefingData.permits || [];
          briefingData.scopeOfWorks = briefingData.scopeOfWorks || [];
        }
        
        console.log('Loaded attendances:', attendancesData);
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

  const formatCommunication = (comm) => {
    if (!comm || typeof comm !== 'object') return 'None';
    const parts = [];
    
    // Site notices
    if (comm.siteNotices) parts.push(`Site Notices:\n${comm.siteNotices}`);
    
    // Visitors
    if (comm.visitors) parts.push(`Visitors:\n${comm.visitors}`);
    
    // New starters
    if (comm.newStarters) parts.push(`New Starters:\n${comm.newStarters}`);
    
    // D&A Testing
    if (comm.daaTesting) parts.push('D&A Testing Required');
    
    // People flying
    if (comm.peopleFlying) {
      const flying = [];
      if (comm.peopleFlying.in) flying.push(`In: ${comm.peopleFlying.in}`);
      if (comm.peopleFlying.out) flying.push(`Out: ${comm.peopleFlying.out}`);
      if (flying.length > 0) parts.push(`People Flying:\n${flying.join('\n')}`);
    }
    
    return parts.length > 0 ? parts.join('\n\n') : 'None';
  };

  const formatHSEIssues = (hse) => {
    if (!hse || typeof hse !== 'object') return 'None';
    const parts = [];
    
    // Hazards
    if (hse.hazards) parts.push(`Hazards:\n${hse.hazards}`);
    
    // Incidents
    if (hse.incidents) parts.push(`Incidents:\n${hse.incidents}`);
    
    // Injuries
    if (hse.injuries) parts.push(`Injuries:\n${hse.injuries}`);
    
    // Take 5
    if (hse.take5Count) parts.push(`Take 5 Count: ${hse.take5Count}`);
    
    // JHA's
    if (hse.jhaCount) parts.push(`JHA Count: ${hse.jhaCount}`);
    
    // Other issues
    if (hse.otherIssues) parts.push(`Other Issues:\n${hse.otherIssues}`);
    
    return parts.length > 0 ? parts.join('\n\n') : 'None';
  };

  const formatPermits = (permits) => {
    if (!permits || !Array.isArray(permits) || permits.length === 0) return 'None';
    return permits.map((permit, index) => `${index + 1}. ${permit}`).join('\n');
  };

  const formatScopeOfWorks = (scope) => {
    if (!scope || !Array.isArray(scope) || scope.length === 0) return 'None';
    return scope.map((work, index) => `${index + 1}. ${work}`).join('\n');
  };

  const generatePDF = async () => {
    console.log('Generating PDF with attendances:', attendances);
    
    // Make a copy of attendances to avoid modifying the state
    const testAttendances = [...attendances];
    
    // Process signatures to ensure they're visible on light background
    testAttendances.forEach(att => {
      if (att.signOnSignature) {
        att.signOnSignature = processSignatureForPdf(att.signOnSignature);
      }
      if (att.signOffSignature) {
        att.signOffSignature = processSignatureForPdf(att.signOffSignature);
      }
    });
    
    console.log('Using attendances for PDF:', testAttendances);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Add corporate header
    try {
      const img = new Image();
      img.src = COMPANY_LOGO_URL;
      doc.addImage(img, 'PNG', margin, yPos, 40, 15);
    } catch (error) {
      doc.setFontSize(12);
      doc.text(COMPANY_NAME, margin, yPos + 10);
    }
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(COMPANY_ADDRESS, pageWidth - margin, yPos + 10, { align: 'right' });
    yPos += 25;
    
    // Title section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PRE-START BRIEFING DOCUMENT', pageWidth/2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 15;
    
    // Header Information Table
    const headerData = [
      ['Date', format(new Date(briefing.date), 'dd/MM/yyyy')],
      ['Location', briefing.location || 'N/A'],
      ['Project Manager', briefing.projectManager || 'N/A'],
      ['Supervisor', briefing.supervisor || 'N/A'],
      ['Weather/Temperature', `${briefing.weather || 'N/A'} / ${briefing.temperature ? `${briefing.temperature}°C` : 'N/A'}`],
      ['UV Index', briefing.uvIndex || 'N/A']
    ];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Briefing Overview', margin, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    headerData.forEach(([label, value], index) => {
      doc.setTextColor(100);
      doc.text(`${label}:`, margin, yPos);
      doc.setTextColor(0);
      doc.text(value, margin + 40, yPos);
      yPos += (index % 2 === 1) ? 7 : 5;
    });
    yPos += 10;

    // Professional Section Template
    const addCorporateSection = (title, content) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(60, 60, 60);
      doc.rect(margin, yPos, pageWidth - margin*2, 8, 'F');
      doc.text(title.toUpperCase(), margin + 5, yPos + 5);
      yPos += 12;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(content, pageWidth - margin*2);
      lines.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += 7;
      });
      yPos += 10;
    };

    // Add sections using corporate template
    addCorporateSection('Communication', formatCommunication(briefing.communication));
    addCorporateSection('HSE Issues', formatHSEIssues(briefing.hseIssues));
    addCorporateSection('Safety Topic', briefing.safetyTopic || 'Not Provided');
    addCorporateSection('Permits Required', formatPermits(briefing.permits));
    addCorporateSection('Work Crew Interactions', briefing.workCrewInteractions || 'Not Provided');
    addCorporateSection('Scope of Works', formatScopeOfWorks(briefing.scopeOfWorks));
    addCorporateSection('Additional Information', briefing.additionalInfo || 'None');

    // Attendance Register
    doc.addPage();
    yPos = margin;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE REGISTER', pageWidth/2, yPos, { align: 'center' });
    yPos += 15;

    // Manual table implementation instead of autoTable
    // Define column widths
    const tableWidth = pageWidth - (margin * 2);
    const colWidths = [
      tableWidth * 0.30, // Name (increased)
      tableWidth * 0.15, // Time On (increased)
      tableWidth * 0.10, // BAC
      tableWidth * 0.25, // Sign On (increased)
      tableWidth * 0.20, // Time Off (increased)
    ];
    
    // Header row
    const headers = ['Name', 'Time On', 'BAC', 'Sign On', 'Time Off'];
    let xPos = margin;
    
    // Draw header background
    doc.setFillColor(BRAND_PRIMARY_RGB[0], BRAND_PRIMARY_RGB[1], BRAND_PRIMARY_RGB[2]);
    doc.rect(margin, yPos, tableWidth, 10, 'F');
    
    // Draw header text
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    headers.forEach((header, i) => {
      doc.text(header, xPos + 3, yPos + 6);
      xPos += colWidths[i];
    });
    
    yPos += 10;
    
    // If no attendances, add a dummy row
    if (!testAttendances || testAttendances.length === 0) {
      console.log('No attendances found, adding dummy row');
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text('No attendees recorded', margin + 3, yPos + 6);
      
      // Draw row border
      doc.setDrawColor(200);
      doc.rect(margin, yPos, tableWidth, 10);
      
      yPos += 10;
    } else {
      console.log('Drawing', testAttendances.length, 'attendance rows');
      // Draw data rows
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      
      testAttendances.forEach((att, rowIndex) => {
        console.log('Drawing row for:', att.name);
        // Alternate row background
        if (rowIndex % 2 === 1) {
          doc.setFillColor(245);
          doc.rect(margin, yPos, tableWidth, 14, 'F');
        }
        
        // Draw row data
        xPos = margin;
        
        // Name
        doc.text(att.name || 'N/A', xPos + 3, yPos + 6);
        xPos += colWidths[0];
        
        // Time On
        doc.text(att.timeOn || 'N/A', xPos + 3, yPos + 6);
        xPos += colWidths[1];
        
        // BAC
        doc.text(att.bac?.toString() || 'N/A', xPos + 3, yPos + 6);
        xPos += colWidths[2];
        
        // Sign On
        if (att.signOnSignature) {
          try {
            // Process signature to ensure it's visible on light background
            const signatureImg = new Image();
            signatureImg.src = att.signOnSignature;
            
            // Calculate better dimensions to fit in the cell
            const cellHeight = 14; // Increased row height for signatures
            const cellWidth = colWidths[3] - 6; // Width with some padding
            const signatureRatio = 3; // Width to height ratio
            
            const signatureWidth = Math.min(cellWidth, 30);
            const signatureHeight = signatureWidth / signatureRatio;
            
            // Center the signature in the cell
            const signatureX = xPos + (colWidths[3] - signatureWidth) / 2;
            const signatureY = yPos + (cellHeight - signatureHeight) / 2 - 2;
            
            doc.addImage(att.signOnSignature, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
          } catch (error) {
            console.error('Error adding signOnSignature:', error);
            doc.text('(signature)', xPos + 3, yPos + 6);
          }
        } else {
          doc.text('(signature)', xPos + 3, yPos + 6);
        }
        xPos += colWidths[3];
        
        // Time Off
        doc.text(att.timeOff || '-', xPos + 3, yPos + 6);
        xPos += colWidths[4];
        
        // Draw row border
        doc.setDrawColor(200);
        doc.rect(margin, yPos, tableWidth, 14); // Increased row height for signatures
        
        yPos += 14; // Increased row height for signatures
        
        // Add page if needed
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
      });
    }
    
    // Draw table border
    doc.setDrawColor(BRAND_PRIMARY_RGB[0], BRAND_PRIMARY_RGB[1], BRAND_PRIMARY_RGB[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin + 15, tableWidth, yPos - (margin + 15));

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, margin, 280);
      doc.text('Official Document - Property of Aqura Technologies', pageWidth - margin, 280, { align: 'right' });
    }

    doc.save(`briefing-${format(new Date(briefing.date), 'yyyy-MM-dd')}.pdf`);
  };

  const handleSignOut = async (attendanceId) => {
    try {
      const timeOff = new Date().toLocaleTimeString('en-US', { hour12: true }).replace(/:\d\d /, ' ');
      
      // Find the attendance record
      const attendance = attendances.find(att => att.id === attendanceId);
      if (!attendance) return;
      
      // Update with time off
      const updatedAttendance = { ...attendance, timeOff };
      
      // Save to database
      await saveAttendance(updatedAttendance);
      
      // Update local state
      setAttendances(prev => prev.map(att => 
        att.id === attendanceId ? updatedAttendance : att
      ));
      
      console.log(`Signed out attendee ${attendance.name} at ${timeOff}`);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out attendee');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ pt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!briefing) {
    return (
      <Container sx={{ pt: 4 }}>
        <Alert severity="warning">Briefing not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          backgroundColor: theme.palette.mode === 'dark' ? '#0A1120' : '#fff',
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
            : 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Pre-Start Briefing Details
          </Typography>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={generatePDF}
            sx={{
              backgroundImage: theme.palette.mode === 'dark'
                ? 'linear-gradient(rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))'
                : 'none'
            }}
          >
            Export to PDF
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Header Information</Typography>
            <Box sx={{ mb: 3 }}>
              <Typography><strong>Date:</strong> {format(new Date(briefing.date), 'dd/MM/yyyy')}</Typography>
              <Typography><strong>Location:</strong> {briefing.location || 'N/A'}</Typography>
              <Typography><strong>Project Manager:</strong> {briefing.projectManager || 'N/A'}</Typography>
              <Typography><strong>Supervisor:</strong> {briefing.supervisor || 'N/A'}</Typography>
              <Typography><strong>Weather:</strong> {briefing.weather || 'N/A'}</Typography>
              <Typography><strong>Temperature:</strong> {briefing.temperature ? `${briefing.temperature}°C` : 'N/A'}</Typography>
              <Typography><strong>UV Index:</strong> {briefing.uvIndex || 'N/A'}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Attendance Summary</Typography>
            <Box sx={{ mb: 3 }}>
              <Typography><strong>Total Attendees:</strong> {attendances.length}</Typography>
              <Typography>
                <strong>Signed Off:</strong> {attendances.filter(a => a.timeOff).length} of {attendances.length}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Briefing Content</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Communication</Typography>
              <Typography 
                paragraph 
                sx={{ 
                  whiteSpace: 'pre-line',
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {formatCommunication(briefing.communication)}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">HSE Issues</Typography>
              <Typography 
                paragraph 
                sx={{ 
                  whiteSpace: 'pre-line',
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {formatHSEIssues(briefing.hseIssues)}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Safety Topic</Typography>
              <Typography 
                paragraph
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {briefing.safetyTopic || 'None'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Permits Required</Typography>
              <Typography 
                paragraph 
                sx={{ 
                  whiteSpace: 'pre-line',
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {formatPermits(briefing.permits)}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Work Crew Interactions</Typography>
              <Typography 
                paragraph
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {briefing.workCrewInteractions || 'None'}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Scope of Works</Typography>
              <Typography 
                paragraph 
                sx={{ 
                  whiteSpace: 'pre-line',
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {formatScopeOfWorks(briefing.scopeOfWorks)}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1">Additional Information</Typography>
              <Typography 
                paragraph
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {briefing.additionalInfo || 'None'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Attendance Register</Typography>
            
            {attendances.length === 0 ? (
              <Typography color="text.secondary">No attendees yet</Typography>
            ) : (
              <List>
                {attendances.map((att) => (
                  <ListItem 
                    key={att.id}
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? '#0F172A' : '#f8f8f8',
                      mb: 1,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                    secondaryAction={
                      !att.timeOff && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleSignOut(att.id)}
                          sx={{ ml: 2 }}
                        >
                          Sign Out
                        </Button>
                      )
                    }
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <ListItemText 
                          primary={att.name || 'N/A'}
                          secondary="Name"
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <ListItemText 
                          primary={att.timeOn || 'N/A'}
                          secondary="Time On"
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <ListItemText 
                          primary={att.bac || 'N/A'}
                          secondary="BAC"
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <ListItemText 
                          primary={att.timeOff || '-'}
                          secondary="Time Off"
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        {att.signOnSignature && (
                          <Box 
                            sx={{ 
                              maxWidth: 100,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              overflow: 'hidden',
                              backgroundColor: theme.palette.mode === 'dark' ? '#1F2937' : '#fff'
                            }}
                          >
                            <img 
                              src={att.signOnSignature} 
                              alt="signature"
                              style={{ width: '100%', height: 'auto' }}
                            />
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ViewBriefing;
