import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import { Pi } from "pi-sdk-react"; // دمج Pi SDK
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import WithdrawalHistory from "./pages/WithdrawalHistory";
import Achievements from "./pages/Achievements";
import VIPBenefits from "./pages/VIPBenefits";
import Legal from "./pages/Legal";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

import { useState } from "react";

const queryClient = new QueryClient();
const pi = new Pi({ apiKey: import.meta.env.VITE_PI_API_KEY });

const App = () => {
  const [user, setUser] = useState<any>(null);

  // Login Function
  const loginWithPi = async () => {
    try {
      const loggedInUser = await pi.authenticate(["username", "payments"]);
      setUser(loggedInUser);
      console.log("User logged in:", loggedInUser);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // Spin Now Function
  const spinNow = async () => {
    if (!user) return alert("Please login first!");
    try {
      const response = await fetch("/supabase/functions/spin-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      const result = await response.json();
      alert(`You won: ${result.reward}`);
      console.log("Spin Result:", result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SoundSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index user={user} onLogin={loginWithPi} onSpin={spinNow} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/withdrawals" element={<WithdrawalHistory />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/vip" element={<VIPBenefits />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SoundSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
