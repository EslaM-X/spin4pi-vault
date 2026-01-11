import { useState, useEffect } from 'react'; import { Toaster } from '@/components/ui/toaster'; import { Toaster as Sonner } from '@/components/ui/sonner'; import { TooltipProvider } from '@/components/ui/tooltip'; import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'; import { SoundSettingsProvider } from '@/contexts/SoundSettingsContext'; import GlobalLoading from '@/components/GlobalLoading';

import Index from '@/pages/Index'; import Profile from '@/pages/Profile'; import Marketplace from '@/pages/Marketplace'; import WithdrawalHistory from '@/pages/WithdrawalHistory'; import Achievements from '@/pages/Achievements'; import VIPBenefits from '@/pages/VIPBenefits'; import Legal from '@/pages/Legal'; import Admin from '@/pages/Admin'; import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const AppRoutes = () => { const location = useLocation(); const [loading, setLoading] = useState(true);

useEffect(() => { // تظهر الـ Loading كل مرة الصفحة تتغير setLoading(true);

// تأخير وهمي لمحاكاة تحميل البيانات
const timer = setTimeout(() => {
  setLoading(false);
}, 1000); // ممكن تغييره حسب بيانات الصفحة الحقيقية

return () => clearTimeout(timer);

}, [location.pathname]);

return ( <> <GlobalLoading isVisible={loading} /> <Routes location={location} key={location.pathname}> <Route path="/" element={<Index />} /> <Route path="/profile" element={<Profile />} /> <Route path="/marketplace" element={<Marketplace />} /> <Route path="/withdrawals" element={<WithdrawalHistory />} /> <Route path="/achievements" element={<Achievements />} /> <Route path="/vip" element={<VIPBenefits />} /> <Route path="/legal" element={<Legal />} /> <Route path="/admin" element={<Admin />} /> <Route path="*" element={<NotFound />} /> </Routes> </> ); };

const App = () => { return ( <QueryClientProvider client={queryClient}> <SoundSettingsProvider> <TooltipProvider> <Toaster /> <Sonner /> <BrowserRouter> <AppRoutes /> </BrowserRouter> </TooltipProvider> </SoundSettingsProvider> </QueryClientProvider> ); };

export default App;
