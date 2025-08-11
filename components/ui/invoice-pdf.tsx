'use client';

import React, { useRef } from 'react';
import { Button } from './button';
import { Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceData } from './invoice';

interface InvoicePDFProps {
  invoiceData: InvoiceData;
  children: React.ReactNode;
  filename?: string;
}

export function InvoicePDF({ invoiceData, children, filename }: InvoicePDFProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const defaultFilename = filename || `invoice-${invoiceData.invoiceNumber}.pdf`;
      pdf.save(defaultFilename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button onClick={generatePDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={generatePDF} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Preview PDF
        </Button>
      </div>
      
      <div ref={invoiceRef} className="bg-white">
        {children}
      </div>
    </div>
  );
}
