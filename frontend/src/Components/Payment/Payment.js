import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment.css';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentData, setPaymentData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const packages = {
    basic: {
      name: 'Basic',
      price: 89700,
      features: ['Attendance Tracking', 'Payment Management', 'Parent App Access', 'Basic Reporting', 'Email Support']
    },
    premium: {
      name: 'Premium',
      price: 149700,
      features: ['Attendance Tracking', 'Payment Management', 'Parent App Access', 'Advanced Analytics', 'Photo Sharing', 'Priority Support', 'Custom Branding']
    },
    enterprise: {
      name: 'Enterprise',
      price: 239700,
      features: ['Attendance Tracking', 'Payment Management', 'Parent App Access', 'Everything in Premium', 'Multi-Location Support', 'API Access', '24/7 Phone Support', 'Dedicated Account Manager']
    }
  };

  useEffect(() => {
    // Get package from URL params or state
    const urlParams = new URLSearchParams(location.search);
    const packageType = urlParams.get('package') || location.state?.package;
    
    if (packageType && packages[packageType]) {
      setSelectedPackage({
        type: packageType,
        ...packages[packageType]
      });
    } else {
      // Default to basic if no package specified
      setSelectedPackage({
        type: 'basic',
        ...packages.basic
      });
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Validation for customer name - only letters and spaces
    if (name === 'customerName') {
      filteredValue = value.replace(/[^A-Za-z\s]/g, '');
    }
    
    // Validation for phone number - only digits
    if (name === 'phone') {
      filteredValue = value.replace(/[^0-9]/g, '');
    }
    
    // Validation for CVV - only digits
    if (name === 'cvv') {
      filteredValue = value.replace(/[^0-9]/g, '');
    }
    
    // Validation for name on card - only letters and spaces
    if (name === 'nameOnCard') {
      filteredValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!paymentData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(paymentData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!paymentData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(paymentData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!paymentData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (paymentData.paymentMethod === 'credit-card') {
      if (!paymentData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!paymentData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be in MM/YY format';
      }

      if (!paymentData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }

      if (!paymentData.nameOnCard.trim()) {
        newErrors.nameOnCard = 'Name on card is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const paymentPayload = {
        ...paymentData,
        package: selectedPackage,
        amount: selectedPackage.price,
        paymentDate: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:5000/api/payments', paymentPayload);
      
      if (response.data.success) {
        // Navigate to receipt page with payment data
        navigate('/payment-receipt', { 
          state: { 
            paymentData: response.data.payment,
            receiptId: response.data.payment._id
          }
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  if (!selectedPackage) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Complete Your Payment</h1>
        <p>You're almost there! Complete your payment to get started.</p>
      </div>

      <div className="payment-content">
        <div className="package-summary">
          <h2>Package Summary</h2>
          <div className="package-card">
            <div className="package-info">
              <h3>{selectedPackage.name} Plan</h3>
              <div className="package-price">
                <span className="currency">Rs.</span>
                <span className="amount">{selectedPackage.price.toLocaleString()}</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="package-features">
              <h4>Included Features:</h4>
              <ul>
                {selectedPackage.features.map((feature, index) => (
                  <li key={index}>
                    <i className="fas fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="payment-form-container">
          <form onSubmit={handleSubmit} className="payment-form">
            <h2>Payment Details</h2>
            
            <div className="form-section">
              <h3>Customer Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customerName">Full Name *</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={paymentData.customerName}
                    onChange={handleInputChange}
                    className={errors.customerName ? 'error' : ''}
                    placeholder="Enter your full name"
                  />
                  {errors.customerName && <span className="error-message">{errors.customerName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={paymentData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={paymentData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={paymentData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="Enter your full address"
                    rows="3"
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={paymentData.paymentMethod === 'credit-card'}
                    onChange={handleInputChange}
                  />
                  <span className="method-info">
                    <i className="fas fa-credit-card"></i>
                    Credit/Debit Card
                  </span>
                </label>
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank-transfer"
                    checked={paymentData.paymentMethod === 'bank-transfer'}
                    onChange={handleInputChange}
                  />
                  <span className="method-info">
                    <i className="fas fa-university"></i>
                    Bank Transfer
                  </span>
                </label>
              </div>

              {paymentData.paymentMethod === 'credit-card' && (
                <div className="card-details">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nameOnCard">Name on Card *</label>
                      <input
                        type="text"
                        id="nameOnCard"
                        name="nameOnCard"
                        value={paymentData.nameOnCard}
                        onChange={handleInputChange}
                        className={errors.nameOnCard ? 'error' : ''}
                        placeholder="Enter name as on card"
                      />
                      {errors.nameOnCard && <span className="error-message">{errors.nameOnCard}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number *</label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handleCardNumberChange}
                        className={errors.cardNumber ? 'error' : ''}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                      {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date *</label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={handleInputChange}
                        className={errors.expiryDate ? 'error' : ''}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="cvv">CVV *</label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentData.cvv}
                        onChange={handleInputChange}
                        className={errors.cvv ? 'error' : ''}
                        placeholder="123"
                        maxLength="4"
                      />
                      {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === 'bank-transfer' && (
                <div className="bank-details">
                  <div className="bank-info">
                    <h4>Bank Transfer Details</h4>
                    <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                    <p><strong>Account Name:</strong> Little Nest Daycare</p>
                    <p><strong>Account Number:</strong> 8001234567</p>
                    <p><strong>Branch:</strong> Colombo 03</p>
                    <p className="note">Please use your name as the reference and email the transfer receipt to payments@littlenest.lk</p>
                  </div>
                </div>
              )}
            </div>

            <div className="payment-summary">
              <div className="summary-row">
                <span>Package:</span>
                <span>{selectedPackage.name}</span>
              </div>
              <div className="summary-row">
                <span>Monthly Fee:</span>
                <span>Rs. {selectedPackage.price.toLocaleString()}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>Rs. {selectedPackage.price.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="pay-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay Rs. ${selectedPackage.price.toLocaleString()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;
