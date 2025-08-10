import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Text } from '@mantine/core';

const ExportTableToPdf = ({ PDFheaders, data, reportName, portfolioName, dateRange }) => {
  const exportPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const headerHeight = 15; // Fixed height for header
    const footerHeight = 10; // Fixed height for footer
    const tableTopMargin = headerHeight + 10; // Space below header before the table starts
    const tableLeftMargin = 5, tableRightMargin= 5, tableBottomMargin= 20 ;

    // Placeholder for total page count
    const pageCountPlaceholder = '{total_pages_count_string}';

    const img = new Image();
    img.src = `${process.env.PUBLIC_URL}/images/Bank_Logo.jpg`;

    // Add header and footer
    const addHeaderAndFooter = (pageNumber) => {
      // Header
      doc.setFontSize(12);
      // doc.text(`${reportName} Data Table Export`, 5, 10);
      doc.text(`${portfolioName}`, pageWidth / 2, 10, {align: 'center'});
      doc.text(`${reportName}`, pageWidth / 2, 15, {align: 'center'});
      doc.text(`${dateRange?.toString().replace(/"/g, '').replace('[','').replace(']', '').replace(',', ' - ')}`, pageWidth / 2, 20, {align: 'center'});
      // doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 52, 10);

      // Footer
      doc.setFontSize(10);
      doc.text(
        `Page ${pageNumber} of ${pageCountPlaceholder}`,
        pageWidth / 2,
        pageHeight - footerHeight,
        { align: 'center' }
      );
      doc.text(`Run on: ${new Date().toLocaleDateString()}`, tableLeftMargin, pageHeight - footerHeight,);
    };

    // Format number with commas and two decimals
    const formatNumber = (num) => {
      return num
        ? parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
        : '0.00';
    };

    // AutoTable setup
    img.onload = () => {
      doc.autoTable({
        head: [PDFheaders.map((col) => ({ content: col.label, styles: { halign: col.align || 'left' } }))], // Align headers
        body: data.map((row) =>
          PDFheaders.map((col) => {
            let value = row[col.key]; 
        
            // Convert `null`, `undefined`, or non-string values safely
            if (value === null || value === undefined) {
              value = ''; // Set to empty string
            } else if (typeof value === 'string') {
              value = value.replace(/null/g, ''); // Remove 'null' if it's a string
            }
        
            return {
              content: typeof value === 'number' ? formatNumber(value) : value,
              styles: { halign: col.align || 'left' }, // Align data cells
            };
          })
        ),
        
        startY: tableTopMargin, // Start below header
        margin: { top: tableTopMargin, left: tableLeftMargin, right: tableRightMargin, bottom: tableBottomMargin }, 
        didDrawPage: (data) => {
          const pageNumber = doc.internal.getNumberOfPages();
          addHeaderAndFooter(pageNumber);

          // Add image for each page
          const logoWidth = 50; // Adjust based on your logo size
          const logoHeight = 13; // Adjust based on your logo size
          const logoX = pageWidth - logoWidth - 5; // Right align with some margin
          const logoY = pageHeight - footerHeight - logoHeight + 2; // Slightly above the footer text

          doc.addImage(img, 'JPEG', logoX, logoY, logoWidth, logoHeight);
        },
      });

      // Put total pages in footer
      doc.putTotalPages(pageCountPlaceholder);

      // Save the PDF
      doc.save(`${reportName}.pdf`);
    };
  };

  return (
    <div style={{ display: PDFheaders?.length > 0 ? 'block' : 'none' }}>
      <Text onClick={exportPdf} style={{ cursor: 'pointer' }}> Download as PDF </Text>
    </div>
  );
};

export default ExportTableToPdf;
