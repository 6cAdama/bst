import React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: '#fff',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '3rem',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 16px 0'
        }}>
          Gemini App
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#a0a0a0',
          lineHeight: '1.6' 
        }}>
          Application initialized successfully.
        </p>
        <div style={{
          marginTop: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(76, 175, 80, 0.2)',
          color: '#81c784',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#66bb6a',
            boxShadow: '0 0 8px #66bb6a'
          }}></span>
          System Online
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
