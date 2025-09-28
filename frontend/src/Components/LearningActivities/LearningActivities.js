import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LearningActivities.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function LearningActivities() {
  const parentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();
  const [childId, setChildId] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for enhanced functionality
  const [viewMode, setViewMode] = useState('all'); // 'all', 'daily', 'weekly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [currentProgress, setCurrentProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  
  // Performance analytics state
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performancePeriod, setPerformancePeriod] = useState('week'); // 'week' or 'month'
  const [activeTab, setActiveTab] = useState('current'); // 'current', 'weekly', 'monthly'

  useEffect(() => {
    // Require parent login to access Learning & Assessment page
    if (!parentUser) {
      navigate('/login');
      return;
    }
    // optionally prefill childId if your parent profile stores a default child
  }, []);

  const fetchActivities = async () => {
    setError('');
    setList([]);
    const id = childId.trim();
    if (!id) { setError('Please enter a Child ID'); return; }
    
    try {
      setLoading(true);
      let url = `http://localhost:5000/learning-activities/by-child/${encodeURIComponent(id)}`;
      let params = {};
      
      if (viewMode === 'daily') {
        params.view = 'daily';
        params.startDate = selectedDate;
      } else if (viewMode === 'weekly') {
        const date = new Date(selectedDate);
        const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
        const endOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 6));
        params.view = 'weekly';
        params.startDate = startOfWeek.toISOString().slice(0, 10);
        params.endDate = endOfWeek.toISOString().slice(0, 10);
      }
      
      const res = await axios.get(url, { params });
      if (res.data?.success) {
        setList(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to fetch learning activities');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch learning activities');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCurrentProgress = async () => {
    const id = childId.trim();
    if (!id) return;
    
    try {
      setProgressLoading(true);
      const res = await axios.get(`http://localhost:5000/learning-activities/progress/${encodeURIComponent(id)}`);
      if (res.data?.success) {
        setCurrentProgress(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setProgressLoading(false);
    }
  };
  
  const fetchPerformanceAnalytics = async (period = 'week') => {
    const id = childId.trim();
    if (!id) return;
    
    try {
      setPerformanceLoading(true);
      const res = await axios.get(`http://localhost:5000/learning-activities/analytics/${encodeURIComponent(id)}`, {
        params: { period }
      });
      if (res.data?.success) {
        setPerformanceData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch performance analytics:', err);
    } finally {
      setPerformanceLoading(false);
    }
  };
  
  const getWeekDateRange = (date) => {
    const d = new Date(date);
    const startOfWeek = new Date(d.setDate(d.getDate() - d.getDay()));
    const endOfWeek = new Date(d.setDate(d.getDate() - d.getDay() + 6));
    return {
      start: startOfWeek.toLocaleDateString(),
      end: endOfWeek.toLocaleDateString()
    };
  };
  
  // Generate chart data for performance trends
  const generatePerformanceCharts = () => {
    if (!performanceData || performanceData.length === 0) {
      return { lineChartData: null, barChartData: null };
    }
    
    const sortedData = [...performanceData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => new Date(item.date).toLocaleDateString());
    
    const lineChartData = {
      labels,
      datasets: [
        {
          label: 'Literacy',
          data: sortedData.map(item => item.progressMetrics?.literacy || 0),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Mathematics',
          data: sortedData.map(item => item.progressMetrics?.mathematics || 0),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Social Skills',
          data: sortedData.map(item => item.progressMetrics?.socialSkills || 0),
          borderColor: '#ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Motor Skills',
          data: sortedData.map(item => item.progressMetrics?.motorSkills || 0),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Creativity',
          data: sortedData.map(item => item.progressMetrics?.creativity || 0),
          borderColor: '#6f42c1',
          backgroundColor: 'rgba(111, 66, 193, 0.1)',
          tension: 0.4,
        },
      ],
    };
    
    // Calculate averages for bar chart
    const averages = {
      literacy: Math.round(sortedData.reduce((sum, item) => sum + (item.progressMetrics?.literacy || 0), 0) / sortedData.length),
      mathematics: Math.round(sortedData.reduce((sum, item) => sum + (item.progressMetrics?.mathematics || 0), 0) / sortedData.length),
      socialSkills: Math.round(sortedData.reduce((sum, item) => sum + (item.progressMetrics?.socialSkills || 0), 0) / sortedData.length),
      motorSkills: Math.round(sortedData.reduce((sum, item) => sum + (item.progressMetrics?.motorSkills || 0), 0) / sortedData.length),
      creativity: Math.round(sortedData.reduce((sum, item) => sum + (item.progressMetrics?.creativity || 0), 0) / sortedData.length),
    };
    
    const barChartData = {
      labels: ['Literacy', 'Mathematics', 'Social Skills', 'Motor Skills', 'Creativity'],
      datasets: [
        {
          label: `Average Performance (${performancePeriod === 'week' ? 'Weekly' : 'Monthly'})`,
          data: [averages.literacy, averages.mathematics, averages.socialSkills, averages.motorSkills, averages.creativity],
          backgroundColor: [
            'rgba(40, 167, 69, 0.8)',
            'rgba(0, 123, 255, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(220, 53, 69, 0.8)',
            'rgba(111, 66, 193, 0.8)',
          ],
          borderColor: [
            '#28a745',
            '#007bff',
            '#ffc107',
            '#dc3545',
            '#6f42c1',
          ],
          borderWidth: 2,
        },
      ],
    };
    
    return { lineChartData, barChartData };
  };
  
  const { lineChartData, barChartData } = generatePerformanceCharts();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Performance Trend (${performancePeriod === 'week' ? 'Weekly' : 'Monthly'})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Average Performance (${performancePeriod === 'week' ? 'Weekly' : 'Monthly'})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
    },
  };
  
  // PDF Generation Functions
  const generatePerformancePDF = async (reportType = 'weekly') => {
    try {
      if (!performanceData || performanceData.length === 0) {
        alert('No performance data available to generate PDF report.');
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Header Design
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(3);
      doc.line(10, 10, pageWidth - 10, 10);

      // Company branding (using similar style as childcare dashboard)
      doc.setFillColor(30, 58, 138);
      doc.rect(15, 15, 30, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('LITTLE', 30, 28, { align: 'center' });
      doc.text('NEST', 30, 35, { align: 'center' });

      // Company name + tagline
      doc.setFontSize(24);
      doc.setTextColor(30, 58, 138);
      doc.text('LITTLE NEST DAYCARE', 55, 28);
      doc.setFontSize(12);
      doc.setTextColor(70, 130, 180);
      doc.text('Quality Childcare & Early Learning Center', 55, 36);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('123 Childcare Lane, City, State 12345 | (555) 123-4567', 55, 42);
      doc.text('info@littlenest.com | www.littlenest.com', 55, 46);

      // Title panel
      const reportTitle = reportType === 'weekly' ? 'WEEKLY PERFORMANCE REPORT' : 'MONTHLY PERFORMANCE REPORT';
      doc.setFillColor(245, 250, 255);
      doc.rect(10, 55, pageWidth - 20, 25, 'F');
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(2);
      doc.rect(10, 55, pageWidth - 20, 25);
      doc.setDrawColor(70, 130, 180);
      doc.setLineWidth(0.5);
      doc.rect(12, 57, pageWidth - 24, 21);
      doc.setFontSize(20);
      doc.setTextColor(30, 58, 138);
      doc.text(reportTitle, pageWidth / 2, 70, { align: 'center' });

      // Metadata box
      doc.setFillColor(250, 252, 255);
      doc.rect(10, 85, pageWidth - 20, 18, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 85, pageWidth - 20, 18);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const currentDate = new Date();
      const period = reportType === 'weekly' ? 'Last 7 Days' : 'Last 30 Days';
      doc.text(`Report Generated: ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, 15, 92);
      doc.text(`Child ID: ${childId || 'N/A'}`, 15, 97);
      doc.text(`Period: ${period}`, pageWidth / 2 + 10, 92);
      doc.text(`Total Records: ${performanceData.length}`, pageWidth / 2 + 10, 97);

      // Performance Summary Section
      let currentY = 110;
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('Performance Summary', 15, currentY);
      currentY += 10;

      // Calculate averages
      const averages = {
        literacy: Math.round(performanceData.reduce((sum, item) => sum + (item.progressMetrics?.literacy || 0), 0) / performanceData.length),
        mathematics: Math.round(performanceData.reduce((sum, item) => sum + (item.progressMetrics?.mathematics || 0), 0) / performanceData.length),
        socialSkills: Math.round(performanceData.reduce((sum, item) => sum + (item.progressMetrics?.socialSkills || 0), 0) / performanceData.length),
        motorSkills: Math.round(performanceData.reduce((sum, item) => sum + (item.progressMetrics?.motorSkills || 0), 0) / performanceData.length),
        creativity: Math.round(performanceData.reduce((sum, item) => sum + (item.progressMetrics?.creativity || 0), 0) / performanceData.length),
      };

      // Summary table
      const summaryTableBody = [
        ['Literacy', `${averages.literacy}%`, getPerformanceGrade(averages.literacy)],
        ['Mathematics', `${averages.mathematics}%`, getPerformanceGrade(averages.mathematics)],
        ['Social Skills', `${averages.socialSkills}%`, getPerformanceGrade(averages.socialSkills)],
        ['Motor Skills', `${averages.motorSkills}%`, getPerformanceGrade(averages.motorSkills)],
        ['Creativity', `${averages.creativity}%`, getPerformanceGrade(averages.creativity)]
      ];

      autoTable(doc, {
        head: [['Skill Area', 'Average Score', 'Grade']],
        body: summaryTableBody,
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 60, halign: 'left' },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // Detailed Progress Records
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('Detailed Progress Records', 15, currentY);
      currentY += 10;

      // Prepare detailed records table
      const detailedTableBody = performanceData
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(record => [
          new Date(record.date).toLocaleDateString(),
          `${record.progressMetrics?.literacy || 0}%`,
          `${record.progressMetrics?.mathematics || 0}%`,
          `${record.progressMetrics?.socialSkills || 0}%`,
          `${record.progressMetrics?.motorSkills || 0}%`,
          `${record.progressMetrics?.creativity || 0}%`,
          record.notes ? record.notes.substring(0, 30) + (record.notes.length > 30 ? '...' : '') : '-'
        ]);

      autoTable(doc, {
        head: [['Date', 'Literacy', 'Math', 'Social', 'Motor', 'Creative', 'Notes']],
        body: detailedTableBody,
        startY: currentY,
        theme: 'striped',
        headStyles: {
          fillColor: [70, 130, 180],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 65, halign: 'left' }
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        }
      });

      // Add new page if needed for insights
      if (doc.lastAutoTable.finalY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;
      } else {
        currentY = doc.lastAutoTable.finalY + 15;
      }

      // Performance Insights
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('Performance Insights', 15, currentY);
      currentY += 10;

      const insights = generateInsights(averages, performanceData);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      insights.forEach((insight, index) => {
        const splitText = doc.splitTextToSize(insight, pageWidth - 30);
        doc.text(splitText, 15, currentY);
        currentY += splitText.length * 5 + 3;
      });

      // Footer
      const footerY = pageHeight - 25;
      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(1);
      doc.line(10, footerY, pageWidth - 10, footerY);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Little Nest Daycare - Confidential Performance Report', 15, footerY + 8);
      doc.text('This document contains confidential child performance data. Handle with care.', 15, footerY + 12);
      doc.text('Generated by: Learning Assessment System v1.0', pageWidth - 15, footerY + 8, { align: 'right' });

      // Save the PDF
      const fileName = `${childId || 'child'}_${reportType}_performance_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  // Helper function to get performance grade
  const getPerformanceGrade = (score) => {
    if (score >= 90) return 'A+ Excellent';
    if (score >= 80) return 'A Good';
    if (score >= 70) return 'B+ Above Avg';
    if (score >= 60) return 'B Average';
    if (score >= 50) return 'C+ Below Avg';
    return 'C Needs Help';
  };

  // Helper function to generate insights
  const generateInsights = (averages, data) => {
    const insights = [];
    
    // Find strongest and weakest skills
    const skillScores = [
      { name: 'Literacy', score: averages.literacy },
      { name: 'Mathematics', score: averages.mathematics },
      { name: 'Social Skills', score: averages.socialSkills },
      { name: 'Motor Skills', score: averages.motorSkills },
      { name: 'Creativity', score: averages.creativity }
    ];
    
    const sortedSkills = skillScores.sort((a, b) => b.score - a.score);
    const strongest = sortedSkills[0];
    const weakest = sortedSkills[sortedSkills.length - 1];
    
    insights.push(`Strongest Skill: ${strongest.name} (${strongest.score}%) - Child shows excellent progress in this area.`);
    insights.push(`Growth Opportunity: ${weakest.name} (${weakest.score}%) - Consider additional activities to support development.`);
    
    // Overall performance assessment
    const overallAverage = Math.round(skillScores.reduce((sum, skill) => sum + skill.score, 0) / skillScores.length);
    insights.push(`Overall Performance: ${overallAverage}% - ${getPerformanceGrade(overallAverage)}`);
    
    // Progress trend
    if (data.length > 1) {
      const recent = data.slice(0, Math.ceil(data.length / 2));
      const earlier = data.slice(Math.ceil(data.length / 2));
      
      const recentAvg = recent.reduce((sum, record) => {
        const recordAvg = (
          (record.progressMetrics?.literacy || 0) +
          (record.progressMetrics?.mathematics || 0) +
          (record.progressMetrics?.socialSkills || 0) +
          (record.progressMetrics?.motorSkills || 0) +
          (record.progressMetrics?.creativity || 0)
        ) / 5;
        return sum + recordAvg;
      }, 0) / recent.length;
      
      const earlierAvg = earlier.reduce((sum, record) => {
        const recordAvg = (
          (record.progressMetrics?.literacy || 0) +
          (record.progressMetrics?.mathematics || 0) +
          (record.progressMetrics?.socialSkills || 0) +
          (record.progressMetrics?.motorSkills || 0) +
          (record.progressMetrics?.creativity || 0)
        ) / 5;
        return sum + recordAvg;
      }, 0) / earlier.length;
      
      const trend = recentAvg - earlierAvg;
      if (trend > 5) {
        insights.push(`Trend Analysis: Positive improvement trend (+${Math.round(trend)}%) - Child is making excellent progress!`);
      } else if (trend < -5) {
        insights.push(`Trend Analysis: Declining trend (${Math.round(trend)}%) - May need additional support and attention.`);
      } else {
        insights.push(`Trend Analysis: Stable performance - Child is maintaining consistent progress levels.`);
      }
    }
    
    // Recommendations
    insights.push(`Recommendation: Continue encouraging ${strongest.name.toLowerCase()} while providing extra support for ${weakest.name.toLowerCase()} through targeted activities and positive reinforcement.`);
    
    return insights;
  };
  
  return (
    <div>
      <Nav />
      <div className="dashboard" style={{ maxWidth: 1200, margin: '40px auto', padding: '0 16px' }}>
        <h1 className="title">Learning & Assessment</h1>
        {!parentUser && (
          <div className="form-error" style={{ marginTop: 8 }}>Please login as a parent to view learning activities.</div>
        )}
        
        {/* Child ID Input */}
        <div className="card full-width" style={{ marginTop: 16 }}>
          <h3>Child Learning Analytics</h3>
          <div className="search-section">
            <div className="actions" style={{ gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Enter Child ID (e.g., A1)"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                style={{ padding: '10px', borderRadius: 8, border: '1px solid #ddd', flex: 1, minWidth: 220 }}
              />
              <button 
                className="btn" 
                type="button" 
                disabled={loading} 
                onClick={() => {
                  fetchActivities();
                  fetchCurrentProgress();
                  fetchPerformanceAnalytics(performancePeriod);
                }}
              >
                {loading ? 'Loading...' : 'Load Data'}
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="tab-navigation" style={{ marginTop: 16, borderBottom: '2px solid #e9ecef' }}>
              <button 
                className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                Current Progress
              </button>
              <button 
                className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('weekly');
                  setPerformancePeriod('week');
                  fetchPerformanceAnalytics('week');
                }}
              >
                Weekly Performance
              </button>
              <button 
                className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('monthly');
                  setPerformancePeriod('month');
                  fetchPerformanceAnalytics('month');
                }}
              >
                Monthly Performance
              </button>
            </div>
          </div>
        </div>
        
        {/* Current Progress Tab */}
        {activeTab === 'current' && (
          <div className="card full-width" style={{ marginTop: 16 }}>
            <h3>Current Progress Status</h3>
            {/* Current Progress Display */}
            {currentProgress && (
              <div className="progress-display" style={{ 
                marginTop: 16, 
                padding: 16, 
                background: '#f8f9fa', 
                borderRadius: 8, 
                border: '1px solid #dee2e6' 
              }}>
                <h4 style={{ marginBottom: 16, color: '#495057' }}>Current Progress Metrics</h4>
                {progressLoading ? (
                  <p>Loading progress...</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div className="metric">
                      <label>Literacy: {currentProgress.progressMetrics?.literacy || 0}%</label>
                      <div style={{ width: '100%', height: 8, background: '#dee2e6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${currentProgress.progressMetrics?.literacy || 0}%`, 
                          height: '100%', 
                          background: '#28a745',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                    <div className="metric">
                      <label>Mathematics: {currentProgress.progressMetrics?.mathematics || 0}%</label>
                      <div style={{ width: '100%', height: 8, background: '#dee2e6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${currentProgress.progressMetrics?.mathematics || 0}%`, 
                          height: '100%', 
                          background: '#007bff'
                        }}></div>
                      </div>
                    </div>
                    <div className="metric">
                      <label>Social Skills: {currentProgress.progressMetrics?.socialSkills || 0}%</label>
                      <div style={{ width: '100%', height: 8, background: '#dee2e6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${currentProgress.progressMetrics?.socialSkills || 0}%`, 
                          height: '100%', 
                          background: '#ffc107'
                        }}></div>
                      </div>
                    </div>
                    <div className="metric">
                      <label>Motor Skills: {currentProgress.progressMetrics?.motorSkills || 0}%</label>
                      <div style={{ width: '100%', height: 8, background: '#dee2e6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${currentProgress.progressMetrics?.motorSkills || 0}%`, 
                          height: '100%', 
                          background: '#dc3545'
                        }}></div>
                      </div>
                    </div>
                    <div className="metric">
                      <label>Creativity: {currentProgress.progressMetrics?.creativity || 0}%</label>
                      <div style={{ width: '100%', height: 8, background: '#dee2e6', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${currentProgress.progressMetrics?.creativity || 0}%`, 
                          height: '100%', 
                          background: '#6f42c1'
                        }}></div>
                      </div>
                    </div>
                  </div>
                )}
                {currentProgress.lastUpdated && (
                  <p style={{ marginTop: 12, fontSize: 14, color: '#6c757d' }}>
                    Last updated: {new Date(currentProgress.lastUpdated).toLocaleDateString()}
                  </p>
                )}
                {currentProgress.notes && (
                  <div style={{ marginTop: 12 }}>
                    <strong>Latest Notes:</strong>
                    <p style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>{currentProgress.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Weekly Performance Tab */}
        {activeTab === 'weekly' && (
          <div className="card full-width" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Weekly Performance Analysis</h3>
              {performanceData && performanceData.length > 0 && (
                <button 
                  className="btn" 
                  onClick={() => generatePerformancePDF('weekly')}
                  style={{ 
                    background: '#28a745', 
                    color: 'white',
                    padding: '8px 16px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Download Weekly Report
                </button>
              )}
            </div>
            {performanceLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p>Loading weekly performance data...</p>
              </div>
            ) : (
              <div>
                {lineChartData && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 20 }}>
                    <div className="chart-container" style={{ height: 400 }}>
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                    <div className="chart-container" style={{ height: 400 }}>
                      <Bar data={barChartData} options={barChartOptions} />
                    </div>
                  </div>
                )}
                {performanceData && performanceData.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4>Weekly Summary</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: 16,
                      marginTop: 16
                    }}>
                      {performanceData.map((record, index) => (
                        <div key={index} style={{ 
                          background: '#f8f9fa', 
                          padding: 12, 
                          borderRadius: 8, 
                          border: '1px solid #e9ecef' 
                        }}>
                          <h5 style={{ margin: '0 0 8px 0', color: '#495057' }}>
                            {new Date(record.date).toLocaleDateString()}
                          </h5>
                          <div style={{ fontSize: 12 }}>
                            <div>📚 Literacy: {record.progressMetrics?.literacy || 0}%</div>
                            <div>🔢 Math: {record.progressMetrics?.mathematics || 0}%</div>
                            <div>🤝 Social: {record.progressMetrics?.socialSkills || 0}%</div>
                            <div>🏃 Motor: {record.progressMetrics?.motorSkills || 0}%</div>
                            <div>🎨 Creative: {record.progressMetrics?.creativity || 0}%</div>
                          </div>
                          {record.notes && (
                            <p style={{ fontSize: 11, color: '#6c757d', marginTop: 8, marginBottom: 0 }}>
                              "{record.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!performanceData || performanceData.length === 0) && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                    <p>No weekly performance data available. Make sure to record daily progress updates.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Monthly Performance Tab */}
        {activeTab === 'monthly' && (
          <div className="card full-width" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Monthly Performance Analysis</h3>
              {performanceData && performanceData.length > 0 && (
                <button 
                  className="btn" 
                  onClick={() => generatePerformancePDF('monthly')}
                  style={{ 
                    background: '#007bff', 
                    color: 'white',
                    padding: '8px 16px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Download Monthly Report
                </button>
              )}
            </div>
            {performanceLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p>Loading monthly performance data...</p>
              </div>
            ) : (
              <div>
                {lineChartData && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 20 }}>
                    <div className="chart-container" style={{ height: 400 }}>
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                    <div className="chart-container" style={{ height: 400 }}>
                      <Bar data={barChartData} options={barChartOptions} />
                    </div>
                  </div>
                )}
                {performanceData && performanceData.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4>Monthly Summary</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                      gap: 16,
                      marginTop: 16
                    }}>
                      {performanceData.map((record, index) => (
                        <div key={index} style={{ 
                          background: '#f8f9fa', 
                          padding: 16, 
                          borderRadius: 8, 
                          border: '1px solid #e9ecef' 
                        }}>
                          <h5 style={{ margin: '0 0 12px 0', color: '#495057' }}>
                            {new Date(record.date).toLocaleDateString()}
                          </h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                            <div>📚 Literacy: {record.progressMetrics?.literacy || 0}%</div>
                            <div>🔢 Mathematics: {record.progressMetrics?.mathematics || 0}%</div>
                            <div>🤝 Social Skills: {record.progressMetrics?.socialSkills || 0}%</div>
                            <div>🏃 Motor Skills: {record.progressMetrics?.motorSkills || 0}%</div>
                            <div style={{ gridColumn: '1 / -1' }}>🎨 Creativity: {record.progressMetrics?.creativity || 0}%</div>
                          </div>
                          {record.notes && (
                            <div style={{ marginTop: 12, padding: 8, background: 'white', borderRadius: 4 }}>
                              <strong style={{ fontSize: 11, color: '#495057' }}>Notes:</strong>
                              <p style={{ fontSize: 11, color: '#6c757d', marginTop: 4, marginBottom: 0 }}>
                                {record.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!performanceData || performanceData.length === 0) && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                    <p>No monthly performance data available. Make sure to record daily progress updates.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Activity Filters and Views */}
        <div className="card full-width" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Learning Activities</h3>
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* View Mode Selector */}
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ced4da' }}
              >
                <option value="all">All Activities</option>
                <option value="daily">Daily View</option>
                <option value="weekly">Weekly View</option>
              </select>
              
              {/* Date Selector */}
              {(viewMode === 'daily' || viewMode === 'weekly') && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ced4da' }}
                />
              )}
              
              <button className="btn" type="button" disabled={loading} onClick={fetchActivities}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* View Mode Info */}
          {viewMode !== 'all' && (
            <div style={{ marginBottom: 12, padding: 8, background: '#e3f2fd', borderRadius: 4, fontSize: 14 }}>
              {viewMode === 'daily' && `Showing activities for: ${new Date(selectedDate).toLocaleDateString()}`}
              {viewMode === 'weekly' && `Showing activities for week: ${getWeekDateRange(selectedDate).start} - ${getWeekDateRange(selectedDate).end}`}
            </div>
          )}
          
          {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
          
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Progress Metrics</th>
                  <th>Notes</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
                      {loading ? 'Loading...' : 'No activities to show'}
                    </td>
                  </tr>
                ) : (
                  list.map((activity) => (
                    <tr key={activity._id}>
                      <td>{activity.date || (activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '-')}</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: 12, 
                          background: activity.activityType === 'progress_update' ? '#28a745' : '#007bff',
                          color: 'white'
                        }}>
                          {activity.activityType === 'progress_update' ? 'Progress' : 'Activity'}
                        </span>
                      </td>
                      <td>{activity.title || '-'}</td>
                      <td>{activity.description || '-'}</td>
                      <td>
                        {activity.progressMetrics ? (
                          <div style={{ fontSize: 12 }}>
                            <div>L: {activity.progressMetrics.literacy}%</div>
                            <div>M: {activity.progressMetrics.mathematics}%</div>
                            <div>S: {activity.progressMetrics.socialSkills}%</div>
                            <div>Motor: {activity.progressMetrics.motorSkills}%</div>
                            <div>C: {activity.progressMetrics.creativity}%</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td>{activity.notes || '-'}</td>
                      <td>{activity.recordedBy || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
