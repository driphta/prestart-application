import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Function to generate a PDF from a briefing and its attendances
export const generateBriefingPDF = (briefing, attendances) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add AQURA logo
  // Note: In a real implementation, you would need to add the actual logo
  // doc.addImage(logo, 'PNG', 150, 10, 40, 15);
  
  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre-shift Briefing Plan and Minutes', 105, 20, { align: 'center' });
  
  // Add header information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Format date if it's a Date object
  const formattedDate = briefing.date instanceof Date 
    ? format(briefing.date, 'dd/MM/yyyy')
    : briefing.date;
  
  // Create header table
  doc.autoTable({
    startY: 30,
    head: [['Date: ' + formattedDate, 'Time: ' + briefing.time, 'Location: ' + briefing.location]],
    body: [
      ['Project Manager: ' + briefing.projectManager, 'Supervisor: ' + briefing.supervisor],
      ['Weather: ' + briefing.weather, 'UV: ' + briefing.uvIndex + '\nTemp Max: ' + briefing.temperature]
    ],
    theme: 'grid',
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 65 },
      2: { cellWidth: 65 }
    }
  });
  
  // Add Communication section
  const lastY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 240);
  doc.rect(14, lastY, 182, 8, 'F');
  doc.text('Communication:', 15, lastY + 6);
  
  // Communication details
  doc.autoTable({
    startY: lastY + 10,
    body: [
      ['☐ Site Notices: ' + (briefing.communication?.siteNotices || 'Nil')],
      ['☐ Site Visitors: ' + (briefing.communication?.siteVisitors || 'Nil')],
      ['☐ New Starters: ' + (briefing.communication?.newStarters || 'Nil')],
      ['☐ D&A Testing: ' + (briefing.communication?.daaTesting || 'Nil')],
      ['☐ People Flying In: ' + (briefing.communication?.peopleFlying?.in || 'Nil')],
      ['☐ People Flying Out: ' + (briefing.communication?.peopleFlying?.out || 'Nil')]
    ],
    theme: 'plain',
    styles: {
      cellPadding: 3,
      fontSize: 10
    }
  });
  
  // Add Personnel section
  const personnelY = doc.lastAutoTable.finalY + 5;
  doc.setFillColor(200, 220, 240);
  doc.rect(14, personnelY, 182, 8, 'F');
  doc.text('Personnel: See daily BAC sign on sheet', 15, personnelY + 6);
  
  // Add HSE Issues section
  const hseY = personnelY + 10;
  doc.setFillColor(200, 220, 240);
  doc.rect(14, hseY, 182, 8, 'F');
  doc.text('HSE Issues:', 15, hseY + 6);
  
  // HSE details
  doc.autoTable({
    startY: hseY + 10,
    body: [
      ['☐ Reported Hazards: ' + (briefing.hseIssues?.reportedHazards || 'Nil')],
      ['☐ Incidents: ' + (briefing.hseIssues?.incidents || 'Nil')],
      ['☐ Injuries: ' + (briefing.hseIssues?.injuries || 'Nil')],
      ['☐ Take 5: ' + (briefing.hseIssues?.take5Count || '0')],
      ['☐ JHA\'s: ' + (briefing.hseIssues?.jhaCount || '0')],
      ['☐ HSE Issues: ' + (briefing.hseIssues?.otherIssues || '')],
      ['☐ Other: ' + (briefing.hseIssues?.other || '')]
    ],
    theme: 'plain',
    styles: {
      cellPadding: 3,
      fontSize: 10
    }
  });
  
  // Add a new page for the rest of the content
  doc.addPage();
  
  // Add Safety Share/Topic section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 240);
  doc.rect(14, 20, 182, 8, 'F');
  doc.text('Safety Share / Topic:', 15, 26);
  
  // Safety topics as bullet points
  if (briefing.safetyTopic && briefing.safetyTopic.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 35;
    
    briefing.safetyTopic.forEach(topic => {
      doc.text('• ' + topic, 20, yPos);
      yPos += 7;
    });
  }
  
  // Add Permits Required section
  const permitsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 60;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 240);
  doc.rect(14, permitsY, 182, 8, 'F');
  doc.text('Permits Required:', 15, permitsY + 6);
  
  // Permits as bullet points
  if (briefing.permitsRequired && briefing.permitsRequired.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = permitsY + 15;
    
    briefing.permitsRequired.forEach(permit => {
      doc.text('• ' + permit.permitType + ' ' + permit.permitNumber, 20, yPos);
      yPos += 7;
    });
  }
  
  // Add Interaction Between Work Crew and Work Areas section
  const interactionY = permitsY + 30;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 240);
  doc.rect(14, interactionY, 182, 8, 'F');
  doc.text('Interaction Between Work Crew and Work Areas:', 15, interactionY + 6);
  
  // Interaction details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(briefing.workCrewInteractions || '', 20, interactionY + 15);
  
  // Add Scope of Works for Today section
  const scopeY = interactionY + 25;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 240);
  doc.rect(14, scopeY, 182, 8, 'F');
  doc.text('Scope of Works for Today:', 15, scopeY + 6);
  
  // Scope of works as numbered list
  if (briefing.scopeOfWorks && briefing.scopeOfWorks.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = scopeY + 15;
    
    briefing.scopeOfWorks.forEach((work, index) => {
      doc.text((index + 1) + '. ' + work, 20, yPos);
      yPos += 7;
    });
  }
  
  // Add Additional Information section
  const additionalY = scopeY + 60;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 240);
  doc.rect(14, additionalY, 182, 8, 'F');
  doc.text('Additional Information:', 15, additionalY + 6);
  
  // Additional information details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(briefing.additionalInformation || '', 20, additionalY + 15);
  
  // Add a new page for the sign-on sheet
  doc.addPage();
  
  // Add Sign-on Sheet title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pre-shift Briefing Plan and Minutes', 105, 20, { align: 'center' });
  
  // Add Sign-on Sheet header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(220, 220, 220);
  doc.rect(14, 30, 182, 10, 'F');
  doc.text('Sign on Sheet', 105, 37, { align: 'center' });
  
  // Prepare attendance data for the table
  const attendanceRows = attendances.map(att => [
    att.name,
    att.timeOn,
    att.bac,
    'Yes', // Sign On is always Yes if recorded
    att.timeOff || '',
    att.timeOff ? 'Yes' : '' // Sign Off is Yes only if timeOff is recorded
  ]);
  
  // Create attendance table
  doc.autoTable({
    startY: 45,
    head: [['NAME', 'TIME ON', 'BAC', 'SIGN ON', 'TIME OFF', 'SIGN OFF']],
    body: attendanceRows,
    theme: 'grid',
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [200, 220, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    }
  });
  
  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Page ' + i + ' of ' + pageCount, 105, 290, { align: 'center' });
    doc.text('AHS-FRM-028_0 Pre-Shift Briefing Plan and Minutes', 105, 295, { align: 'center' });
  }
  
  return doc;
};

// Function to save the PDF
export const savePDF = (doc, filename) => {
  doc.save(filename);
};

// Function to open the PDF in a new tab
export const openPDF = (doc) => {
  const pdfDataUri = doc.output('datauristring');
  window.open(pdfDataUri, '_blank');
};

// Function to email the PDF (placeholder - would need to be implemented with a backend service)
export const emailPDF = (doc, emailAddress, subject, body) => {
  // In a real implementation, you would:
  // 1. Convert the PDF to a blob or base64 string
  // 2. Send it to a backend service that can send emails with attachments
  // 3. The backend would use a service like SendGrid, Mailgun, or Azure Communication Services
  
  // For now, we'll just open the PDF and show an alert
  alert(`PDF would be emailed to ${emailAddress} with subject: ${subject}`);
  openPDF(doc);
  
  // Return a promise that would normally be fulfilled when the email is sent
  return Promise.resolve({
    success: true,
    message: `Email would be sent to ${emailAddress}`
  });
};
