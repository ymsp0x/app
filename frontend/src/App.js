import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initTelegramWebApp, isTelegramWebApp, getTelegramUser } from './utils/telegramApp';
import Dashboard from './pages/Dashboard';
import ProofSubmission from './components/ProofSubmission';
import MintNFT from './components/MintNFT';
import NotFound from './pages/NotFound';
import './styles/App.css';

function App() {
  const [telegramReady, setTelegramReady] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Initialize Telegram Web App
    if (isTelegramWebApp()) {
      const webApp = initTelegramWebApp();
      if (webApp) {
        setTelegramReady(true);
        setUser(getTelegramUser());
      }
    } else {
      // For development outside of Telegram
      console.warn('Running outside of Telegram Web App');
      setTelegramReady(true);
      setUser({ id: '123456789', first_name: 'Test', username: 'testuser' });
    }
  }, []);
  
  if (!telegramReady) {
    return <div className="loading">Loading Telegram Web App...</div>;
  }
  
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/submit-proof" element={<ProofSubmission user={user} />} />
          <Route path="/mint" element={<MintNFT user={user} />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
