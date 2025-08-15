'use client';

import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Download, FileText, Eye, Printer, Share2, Loader } from 'lucide-react';
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
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    setIsGenerating(true);
    try {
      // Enhanced canvas options for better quality
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: invoiceRef.current.scrollWidth,
        windowHeight: invoiceRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // 10mm margin on all sides
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Calculate image dimensions to fit within A4 margins
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pageNumber++;
        
        // Add page number to each page (except first)
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        
        pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }

      const defaultFilename = filename || `tax-invoice-${invoiceData.invoiceNumber}.pdf`;
      pdf.save(defaultFilename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const printInvoice = async () => {
    if (!invoiceRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Tax Invoice - ${invoiceData.invoiceNumber}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: Arial, sans-serif;
                }
                img { 
                  width: 100%; 
                  height: auto; 
                  max-width: 100%;
                }
                @media print {
                  body { 
                    padding: 0; 
                    margin: 0;
                  }
                  img { 
                    page-break-inside: avoid; 
                    max-width: none;
                    width: 100%;
                  }
                  @page {
                    size: A4;
                    margin: 10mm;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" alt="Tax Invoice" />
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 1000);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareInvoice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tax Invoice - ${invoiceData.invoiceNumber}`,
          text: `Tax Invoice for ${invoiceData.billTo.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing invoice:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
        console.log('Invoice URL copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Action Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center space-x-2">
                </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
              size="sm"
            >
              {isGenerating ? (
                <Loader className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={printInvoice}
              disabled={isGenerating}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2 text-xs"
              size="sm"
            >
              <Printer className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={shareInvoice}
              className="border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2 text-xs"
              size="sm"
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Information Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-sm font-medium text-gray-600 block">Invoice Number</span>
            <span className="text-lg font-bold text-gray-900">{invoiceData.invoiceNumber}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 block">Guest Name</span>
            <span className="text-lg font-semibold text-gray-900">{invoiceData.billTo.name}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 block">Total Amount</span>
            <span className="text-lg font-bold text-green-600">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: invoiceData.currency || 'INR',
              }).format(invoiceData.total)}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 block">Status</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Generated
            </span>
          </div>
        </div>
      </div>
      
      {/* Invoice Content with A4 styling */}
      <div 
        ref={invoiceRef} 
        className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          backgroundColor: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {children}
      </div>

      {/* Footer Information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="text-center text-sm text-gray-600">
          <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}
