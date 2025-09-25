import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './PaymentReceipt.css';
// Import logo - using require to handle special characters in filename
const logoImage = require('../../assets/WhatsApp Image 2025-08-05 at 19.02.34_b673857a - Copy.jpg');

function PaymentReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [receiptId, setReceiptId] = useState('');

  useEffect(() => {
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
      setReceiptId(location.state.receiptId || generateReceiptId());
    } else {
      // Redirect to home if no payment data
      navigate('/');
    }
  }, [location, navigate]);

  const generateReceiptId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `LN${timestamp}${random}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header Section
      // Add decorative border at top
      doc.setDrawColor(30, 58, 138); // Professional dark blue
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);
      
      // Company logo - use the actual logo image
      try {
        doc.addImage(logoImage.default || logoImage, 'JPEG', 15, 15, 30, 30);
      } catch (logoError) {
        console.error('Error loading logo:', logoError);
        // Fallback to professional design if logo fails to load
        doc.setFillColor(30, 58, 138);
        doc.rect(15, 15, 30, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LITTLE', 30, 28, { align: 'center' });
        doc.text('NEST', 30, 35, { align: 'center' });
      }
      
      // Company name and details
      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138); // Professional dark blue
      doc.text('LITTLE NEST DAYCARE', 55, 28);
      
      doc.setFontSize(12);
      doc.setTextColor(70, 130, 180);
      doc.text('Quality Childcare & Early Learning Center', 55, 36);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('📍 123 Childcare Lane, City, State 12345 | 📞 (555) 123-4567', 55, 42);
      doc.text('✉️ info@littlenest.com | 🌐 www.littlenest.com', 55, 46);
      
      // Report title section with gradient effect
      doc.setFillColor(245, 250, 255); // Very light blue background
      doc.rect(10, 55, pageWidth - 20, 25, 'F');
      doc.setDrawColor(30, 58, 138); // Dark blue border
      doc.setLineWidth(2);
      doc.rect(10, 55, pageWidth - 20, 25);
      
      // Add subtle inner border
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(0.5);
      doc.rect(12, 57, pageWidth - 24, 21);
      
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138); // Professional dark blue
      doc.text('PAYMENT RECEIPT', pageWidth / 2, 70, { align: 'center' });
      
      // Receipt metadata in professional layout
      doc.setFillColor(250, 252, 255); // Very subtle background
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      doc.text(`Receipt ID: ${receiptId}`, 15, 92);
      doc.text(`Payment Date: ${formatDate(paymentData.paymentDate)}`, 15, 97);
      doc.text(`Transaction ID: ${paymentData.transactionId || 'TXN' + Date.now()}`, pageWidth / 2 + 10, 92);
      doc.text(`Status: PAID`, pageWidth / 2 + 10, 97);
      
      // Customer Information Section
      const customerY = 115;
      doc.setFillColor(245, 250, 255);
      doc.rect(10, customerY, pageWidth - 20, 35, 'F');
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(1);
      doc.rect(10, customerY, pageWidth - 20, 35);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.text('CUSTOMER INFORMATION', 15, customerY + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${paymentData.customerName}`, 15, customerY + 18);
      doc.text(`Email: ${paymentData.email}`, 15, customerY + 23);
      doc.text(`Phone: ${paymentData.phone}`, 15, customerY + 28);
      doc.text(`Address: ${paymentData.address}`, pageWidth / 2, customerY + 18);
      
      // Package Details Table
      const packageY = customerY + 45;
      const packageTableData = [
        ['Package Type', paymentData.package.name + ' Plan'],
        ['Monthly Fee', `Rs. ${paymentData.amount.toLocaleString()}`],
        ['Payment Method', paymentData.paymentMethod === 'credit-card' ? 'Credit/Debit Card' : 'Bank Transfer'],
        ['Subscription Period', '1 Month'],
        ['Next Billing Date', new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()]
      ];
      
      autoTable(doc, {
        head: [['Description', 'Details']],
        body: packageTableData,
        startY: packageY,
        theme: 'grid',
        alternateRowStyles: {
          fillColor: [248, 251, 255]
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: { top: 4, right: 8, bottom: 4, left: 8 }
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', fillColor: [250, 252, 255] },
          1: { halign: 'left' }
        }
      });
      
      // Package Features Section
      const featuresY = doc.lastAutoTable.finalY + 15;
      doc.setFillColor(240, 248, 255);
      doc.rect(10, featuresY, pageWidth - 20, 40, 'F');
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(1);
      doc.rect(10, featuresY, pageWidth - 20, 40);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.text('INCLUDED FEATURES', 15, featuresY + 10);
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const features = paymentData.package.features || [];
      const midPoint = Math.ceil(features.length / 2);
      
      features.slice(0, midPoint).forEach((feature, index) => {
        doc.text(`✓ ${feature}`, 15, featuresY + 18 + (index * 4));
      });
      
      features.slice(midPoint).forEach((feature, index) => {
        doc.text(`✓ ${feature}`, pageWidth / 2, featuresY + 18 + (index * 4));
      });
      
      // Payment Summary
      const summaryY = featuresY + 50;
      doc.setFillColor(245, 250, 255);
      doc.rect(10, summaryY, pageWidth - 20, 25, 'F');
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(1);
      doc.rect(10, summaryY, pageWidth - 20, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.text('PAYMENT SUMMARY', 15, summaryY + 10);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Package Fee: Rs. ${paymentData.amount.toLocaleString()}`, 15, summaryY + 18);
      doc.text(`Tax: Rs. 0.00`, pageWidth / 2, summaryY + 18);
      
      // Total Amount (highlighted)
      doc.setFillColor(30, 58, 138);
      doc.rect(10, summaryY + 25, pageWidth - 20, 12, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`TOTAL PAID: Rs. ${paymentData.amount.toLocaleString()}`, pageWidth / 2, summaryY + 33, { align: 'center' });
      
      // Footer
      const footerY = pageHeight - 25;
      
      // Footer line
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      
      // Footer content
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Payment Receipt', 15, footerY + 8);
      doc.text(`Page 1 of 1`, pageWidth - 15, footerY + 8, { align: 'right' });
      doc.text('Thank you for choosing Little Nest Daycare for your childcare needs.', 15, footerY + 12);
      doc.text(`Generated: ${currentDate.toLocaleString()}`, pageWidth - 15, footerY + 12, { align: 'right' });
      
      // Disclaimer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('© 2024 Little Nest Daycare. All rights reserved. This is an official payment receipt.', pageWidth / 2, footerY + 18, { align: 'center' });
      
      doc.save(`Little-Nest-Payment-Receipt-${receiptId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const printReceipt = () => {
    window.print();
  };

  if (!paymentData) {
    return <div className="loading">Loading receipt...</div>;
  }

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h1>Payment Successful!</h1>
        <p>Thank you for your payment. Your receipt is ready.</p>
      </div>

      <div className="receipt-content">
        <div className="receipt-card" id="receipt-content">
          <div className="receipt-top">
            <div className="company-info">
              <h2>LITTLE NEST DAYCARE</h2>
              <p>Where little dreams grow big</p>
              <div className="contact-info">
                <p>📧 info@littlenest.lk</p>
                <p>📞 +94 11 234 5678</p>
                <p>📍 123 Main Street, Colombo 03</p>
              </div>
            </div>
            <div className="receipt-details">
              <h3>RECEIPT</h3>
              <div className="receipt-meta">
                <p><strong>Receipt ID:</strong> {receiptId}</p>
                <p><strong>Date:</strong> {formatDate(paymentData.paymentDate)}</p>
                <p><strong>Status:</strong> <span className="status-paid">PAID</span></p>
              </div>
            </div>
          </div>

          <div className="receipt-body">
            <div className="customer-section">
              <h4>Customer Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Name:</span>
                  <span className="value">{paymentData.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{paymentData.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{paymentData.phone}</span>
                </div>
                <div className="info-item full-width">
                  <span className="label">Address:</span>
                  <span className="value">{paymentData.address}</span>
                </div>
              </div>
            </div>

            <div className="package-section">
              <h4>Package Details</h4>
              <div className="package-info">
                <div className="package-name">
                  <h5>{paymentData.package.name} Plan</h5>
                  <span className="package-price">Rs. {paymentData.amount.toLocaleString()}/month</span>
                </div>
                <div className="package-features">
                  <p><strong>Included Features:</strong></p>
                  <ul>
                    {paymentData.package.features.map((feature, index) => (
                      <li key={index}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="payment-section">
              <h4>Payment Summary</h4>
              <div className="payment-details">
                <div className="payment-row">
                  <span>Package:</span>
                  <span>{paymentData.package.name} Plan</span>
                </div>
                <div className="payment-row">
                  <span>Payment Method:</span>
                  <span>{paymentData.paymentMethod === 'credit-card' ? 'Credit/Debit Card' : 'Bank Transfer'}</span>
                </div>
                <div className="payment-row">
                  <span>Monthly Fee:</span>
                  <span>Rs. {paymentData.amount.toLocaleString()}</span>
                </div>
                <div className="payment-row total">
                  <span><strong>Total Paid:</strong></span>
                  <span><strong>Rs. {paymentData.amount.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="receipt-footer">
            <div className="thank-you">
              <h4>Thank You!</h4>
              <p>We're excited to welcome you to the Little Nest family. Your subscription is now active.</p>
            </div>
            <div className="next-steps">
              <h5>Next Steps:</h5>
              <ul>
                <li>You will receive a welcome email with login credentials</li>
                <li>Download the parent app from your app store</li>
                <li>Contact us to schedule your child's enrollment</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="receipt-actions">
          <button onClick={downloadPDF} className="action-btn download-btn">
            <i className="fas fa-download"></i>
            Download PDF
          </button>
          <button onClick={printReceipt} className="action-btn print-btn">
            <i className="fas fa-print"></i>
            Print Receipt
          </button>
          <button onClick={() => navigate('/')} className="action-btn home-btn">
            <i className="fas fa-home"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentReceipt;
