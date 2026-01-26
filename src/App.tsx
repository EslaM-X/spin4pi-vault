import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SoundSettingsProvider } from '@/contexts/SoundSettingsContext';

// Pages
import Index from '@/pages/Index';
import Admin from '@/pages/Admin';
import Profile from '@/pages/Profile';
import Marketplace from '@/pages/Marketplace';
import WithdrawalHistory from '@/pages/WithdrawalHistory';
import Achievements from '@/pages/Achievements';
import VIPBenefits from '@/pages/VIPBenefits';
import Leaderboard from '@/pages/Leaderboard'; 
import Legal from '@/pages/Legal';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/withdrawals" element={<WithdrawalHistory />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/vip-benefits" element={<VIPBenefits />} /> 
      <Route path="/leaderboard" element={<Leaderboard />} /> 
      <Route path="/legal" element={<Legal />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SoundSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" richColors />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </SoundSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
