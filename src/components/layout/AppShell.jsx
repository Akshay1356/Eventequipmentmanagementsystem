import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LoadingExperience from '../loading/LoadingExperience';

export function AppShell() {
  const [isInitializing, setIsInitializing] = useState(true);

  // Hard safety timeout: loader will NEVER block the screen longer than 4.5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="aura-app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isInitializing && (
        <LoadingExperience onComplete={() => setIsInitializing(false)} />
      )}
      <Header />
      <main className="aura-main-content" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppShell;
