import React, { useState } from 'react';
import './CreateChild.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Little Nest assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const predefinedResponses = {
    'hello': 'Hello! Welcome to Little Nest Daycare. How can I assist you?',
    'hi': 'Hi there! I\'m here to help with any questions about our daycare services.',
    'hours': 'Our daycare is open Monday to Friday, 7:00 AM to 6:00 PM.',
    'contact': 'You can reach us at (555) 123-4567 or email info@littlenest.com',
    'enrollment': 'To enroll your child, please use the "Create Child Record" section above to submit a request.',
    'age': 'We accept children from 1 to 12 years old.',
    'activities': 'We offer various learning activities including arts & crafts, reading time, outdoor play, and educational games.',
    'meals': 'We provide healthy snacks and lunch. Please inform us of any allergies in the health notes.',
    'pickup': 'Please ensure authorized guardians pick up children. Late pickup fees may apply after 6:00 PM.',
    'calendar': 'Check our calendar section above for upcoming events and important dates.',
    'help': 'I can help with information about hours, enrollment, activities, meals, pickup policies, and general daycare questions.'
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    // Default response
    return "I'm not sure about that. You can ask me about our hours, enrollment, activities, meals, pickup policies, or contact information. Type 'help' to see what I can assist you with.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      { id: 1, text: "Hello! I'm your Little Nest assistant. How can I help you today?", sender: 'bot' }
    ]);
    setInputMessage('');
    setIsTyping(false);
  };

  return (
    <div className="create-container">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>🤖 Little Nest Assistant</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>Ask me anything about our daycare!</p>
          </div>
          <button
            onClick={resetChat}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🔄 Reset Chat
          </button>
        </div>

        <div style={{
          height: '400px',
          overflowY: 'auto',
          padding: '1rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderTop: 'none'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: '18px',
                  background: message.sender === 'user' 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    : '#ffffff',
                  color: message.sender === 'user' ? 'white' : '#374151',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  border: message.sender === 'bot' ? '1px solid #e5e7eb' : 'none'
                }}
              >
                {message.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '18px',
                background: '#ffffff',
                color: '#6b7280',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#9ca3af',
                    animation: 'pulse 1.5s infinite'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#9ca3af',
                    animation: 'pulse 1.5s infinite 0.2s'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#9ca3af',
                    animation: 'pulse 1.5s infinite 0.4s'
                  }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '1rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '20px',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              padding: '0.75rem 1.5rem',
              background: !inputMessage.trim() || isTyping 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: !inputMessage.trim() || isTyping ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            Send
          </button>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 80%, 100% { opacity: 0.3; }
            40% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
