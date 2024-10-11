import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import htmlToPdfmake from 'html2pdf.js';

const PdfDownloader = () => {
  const [loading, setLoading] = useState(false);

  // Function to fetch HTML data from the URL
  const fetchHtml = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://213.210.36.208:9000/scalesecure/output/66db95fe33ab88701637c05e.html?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=sDVORzWIn5E1oa0AB9Ry%2F20240906%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240906T235402Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=0c3f424738c21cfe644448c5d83c1047500b8be0273fa9871c2b4e389d6c2fc5', {
        responseType: 'document',
      });
      console.log("response", response)
      const htmlContent = response.data;
      console.log("htmlContent", htmlContent)
      createPdf(htmlContent);
    } catch (error) {
      console.error('Error fetching the HTML content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to convert HTML to PDF and download
  const createPdf = (htmlContent) => {
    const pdfDoc = new jsPDF();

    // Convert the HTML content to pdfMake format
    const pdfMakeContent = htmlToPdfmake(htmlContent.innerHTML);

    // Add the PDF content and save it
    pdfDoc.text(pdfMakeContent, 10, 10);
    pdfDoc.save('download.pdf');
  };

  return (
    <div>
      <button onClick={fetchHtml} disabled={loading}>
        {loading ? 'Generating PDF...' : 'Download PDF'}
      </button>
    </div>
  );
};

export default PdfDownloader;
