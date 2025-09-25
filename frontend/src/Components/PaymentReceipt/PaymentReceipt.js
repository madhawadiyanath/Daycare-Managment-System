import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import './PaymentReceipt.css';

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
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('LITTLE NEST DAYCARE', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 20, 45);
    
    // Receipt details
    doc.setFontSize(10);
    doc.text(`Receipt ID: ${receiptId}`, 20, 60);
    doc.text(`Date: ${formatDate(paymentData.paymentDate)}`, 20, 70);
    
    // Customer information
    doc.setFontSize(14);
    doc.text('Customer Information:', 20, 90);
    doc.setFontSize(10);
    doc.text(`Name: ${paymentData.customerName}`, 20, 105);
    doc.text(`Email: ${paymentData.email}`, 20, 115);
    doc.text(`Phone: ${paymentData.phone}`, 20, 125);
    doc.text(`Address: ${paymentData.address}`, 20, 135);
    
    // Package information
    doc.setFontSize(14);
    doc.text('Package Details:', 20, 155);
    doc.setFontSize(10);
    doc.text(`Package: ${paymentData.package.name} Plan`, 20, 170);
    doc.text(`Monthly Fee: Rs. ${paymentData.amount.toLocaleString()}`, 20, 180);
    
    // Payment information
    doc.setFontSize(14);
    doc.text('Payment Information:', 20, 200);
    doc.setFontSize(10);
    doc.text(`Payment Method: ${paymentData.paymentMethod === 'credit-card' ? 'Credit/Debit Card' : 'Bank Transfer'}`, 20, 215);
    doc.text(`Amount Paid: Rs. ${paymentData.amount.toLocaleString()}`, 20, 225);
    doc.text(`Status: Paid`, 20, 235);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for choosing Little Nest Daycare!', 20, 260);
    doc.text('For any queries, contact us at info@littlenest.lk or +94 11 234 5678', 20, 270);
    
    doc.save(`Little_Nest_Receipt_${receiptId}.pdf`);
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
