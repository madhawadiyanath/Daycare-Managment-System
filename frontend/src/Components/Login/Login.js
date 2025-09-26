import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    try {
      // 1) Try admin login first
      const adminResp = await axios.post('http://localhost:5000/admin/login', {
        username: formData.username.trim(),
        password: formData.password
      });

      if (adminResp.data?.success) {
        localStorage.setItem('admin', JSON.stringify(adminResp.data.admin));
        alert('Admin login successful!');
        navigate('/admin/dashboard');
        return;
      }
    } catch (adminErr) {
      // 2) If admin fails with 401, try Finance Manager login
      if (adminErr?.response?.status === 401) {
        try {
          const fmResp = await axios.post('http://localhost:5000/admin/finance-managers/login', {
            username: formData.username.trim(),
            password: formData.password
          });
          if (fmResp.data?.success) {
            localStorage.setItem('financeManager', JSON.stringify(fmResp.data.manager));
            alert('Finance Manager login successful!');
            navigate('/mainfina');
            return;
          }
        } catch (fmErr) {
          // 3) If FM fails with 401, try Inventory Manager login
          if (fmErr?.response?.status === 401) {
            try {
              const imResp = await axios.post('http://localhost:5000/admin/inventory-managers/login', {
                username: formData.username.trim(),
                password: formData.password
              });
              if (imResp.data?.success) {
                localStorage.setItem('inventoryManager', JSON.stringify(imResp.data.manager));
                alert('Inventory Manager login successful!');
                navigate('/inventory/dashboard');
                return;
              }
            } catch (imErr) {
              // 4) If Inventory Manager fails with 401, try Teacher login
              if (imErr?.response?.status === 401) {
                try {
                  const tResp = await axios.post('http://localhost:5000/admin/teachers/login', {
                    username: formData.username.trim(),
                    password: formData.password
                  });
                  if (tResp.data?.success) {
                    localStorage.setItem('teacher', JSON.stringify(tResp.data.teacher));
                    alert('Teacher login successful!');
                    navigate('/teacher/dashboard');
                    return;
                  }
                } catch (tErr) {
                  // 5) If Teacher fails with 401, try Staff login
                  if (tErr?.response?.status === 401) {
                    try {
                      const sResp = await axios.post('http://localhost:5000/admin/staff/login', {
                        username: formData.username.trim(),
                        password: formData.password
                      });
                      if (sResp.data?.success) {
                        localStorage.setItem('staff', JSON.stringify(sResp.data.staff));
                        alert('Staff login successful!');
                        navigate('/staff/dashboard');
                        return;
                      }
                    } catch (sErr) {
                      // 6) If Staff fails with 401, try normal user login
                      if (sErr?.response?.status === 401) {
                        try {
                          const response = await axios.post('http://localhost:5000/users/login', {
                            username: formData.username.trim().toLowerCase(),
                            password: formData.password
                          });

                          if (response.data.success) {
                            localStorage.setItem('user', JSON.stringify(response.data.user));
                            alert('Login successful!');
                            navigate('/goHome');
                            return;
                          }
                        } catch (userErr) {
                          if (userErr.response?.data?.message) {
                            setErrors({ submit: userErr.response.data.message });
                          } else {
                            setErrors({ submit: 'Login failed. Please try again.' });
                          }
                          console.error('User login error:', userErr);
                        }
                      } else {
                        setErrors({ submit: 'Login failed. Please try again.' });
                        console.error('Staff login error:', sErr);
                      }
                    }
                  } else {
                    setErrors({ submit: 'Login failed. Please try again.' });
                    console.error('Teacher login error:', tErr);
                  }
                }
              } else {
                setErrors({ submit: 'Login failed. Please try again.' });
                console.error('Inventory manager login error:', imErr);
              }
            }
          } else {
            setErrors({ submit: 'Login failed. Please try again.' });
            console.error('Finance manager login error:', fmErr);
          }
        }
      } else {
        // Non-auth error while calling admin login
        setErrors({ submit: 'Login failed. Please try again.' });
        console.error('Admin login error:', adminErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <span 
              className="signup-link"
              onClick={() => navigate('/joinUs')}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
