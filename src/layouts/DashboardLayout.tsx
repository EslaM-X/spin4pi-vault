import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * DashboardLayout
 * - Wrapper موحد لكل صفحات الداشبورد
 * - Global Loading
 * - Auth Guard (قابل للتوسيع)
 * - Safe for Pi Browser & Vercel build
 */

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    // 🔐 مكان التحقق من تسجيل الدخول (مستقبلاً Pi Auth)
    // حالياً Safe Stub عشان الـ build
    const init = async () => {
      try {
        // مثال مستقبلي:
        // const auth = await Pi.authenticate(...)
        // setIsAuthenticated(!!auth);

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 🌍 Global Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-pi-purple" />
      </div>
    );
  }

  // 🔒 Guard
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header / Navbar (جاهز للتوسيع) */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
          <h1 className="text-lg font-display font-bold text-pi-purple">
            Spin4Pi Vault
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl p-4">
        {children}
      </main>
    </div>
  );
}
