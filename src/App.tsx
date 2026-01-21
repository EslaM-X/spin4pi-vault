import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SoundSettingsProvider } from '@/contexts/SoundSettingsContext';
import GlobalLoading from '@/components/GlobalLoading';

// استيراد الصفحات
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Marketplace from '@/pages/Marketplace';
import WithdrawalHistory from '@/pages/WithdrawalHistory';
import Achievements from '@/pages/Achievements';
import VIPBenefits from '@/pages/VIPBenefits';
import Leaderboard from '@/pages/Leaderboard'; 
import Legal from '@/pages/Legal';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

import { LegalConsentModal } from '@/components/LegalConsentModal';

const queryClient = new QueryClient();

// هذا الجزء هو المسؤول عن حركة التنقل والتحميل بين الصفحات
const AppRoutes = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // نظام التحميل الذكي عند تغيير الصفحة
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <LegalConsentModal />
      <GlobalLoading isVisible={loading} />

      <Routes location={location}>
        {/* المسارات الأساسية */}
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/withdrawals" element={<WithdrawalHistory />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/vip-benefits" element={<VIPBenefits />} /> 
        <Route path="/leaderboard" element={<Leaderboard />} /> 
        <Route path="/legal" element={<Legal />} />
        
        {/* صفحة الخطأ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SoundSettingsProvider>
        <TooltipProvider>
          {/* التنبيهات الافتراضية */}
          <Toaster />
          {/* التنبيهات الملونة الاحترافية (Sonner) */}
          <Sonner position="top-center" expand={false} richColors />
          
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SoundSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
