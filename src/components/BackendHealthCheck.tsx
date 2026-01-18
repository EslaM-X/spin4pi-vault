import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp, Server, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HealthStatus {
  status: "checking" | "healthy" | "error";
  host: string;
  latency: number | null;
  lastChecked: Date | null;
  error?: string;
}

export function BackendHealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    status: "checking",
    host: "",
    latency: null,
    lastChecked: null,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "unknown";
      let host = "unknown";
      try { host = new URL(supabaseUrl).hostname; } catch { host = supabaseUrl; }

      const { error } = await supabase.functions.invoke("get-leaderboard");
      const latency = Date.now() - startTime;

      if (error) {
        setHealth({ status: "error", host, latency, lastChecked: new Date(), error: error.message });
      } else {
        setHealth({ status: "healthy", host, latency, lastChecked: new Date() });
      }
    } catch (err) {
      setHealth({
        status: "error",
        host: "unknown",
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : "Connection Terminated",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusThemes = {
    checking: { text: "text-gold", bg: "bg-gold/5", border: "border-gold/20", icon: RefreshCw },
    healthy: { text: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20", icon: ShieldCheck },
    error: { text: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20", icon: XCircle },
  };

  const currentTheme = statusThemes[health.status];

  return (
    <motion.div
      className={`fixed bottom-6 right-6 z-[100] rounded-2xl border-2 ${currentTheme.bg} ${currentTheme.border} backdrop-blur-xl shadow-2xl overflow-hidden min-w-[160px]`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Glow Effect based on status */}
      <div className={`absolute -inset-1 blur-lg opacity-20 ${currentTheme.bg}`} />

      {/* Main Header / Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative flex items-center justify-between gap-3 px-4 py-3 w-full group"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
             <currentTheme.icon 
              className={`w-4 h-4 ${currentTheme.text} ${
                health.status === "checking" || isChecking ? "animate-spin" : ""
              }`} 
            />
            {health.status === "healthy" && (
              <motion.div 
                className="absolute inset-0 bg-emerald-400 rounded-full blur-sm"
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${currentTheme.text}`}>
            {health.status === "checking" ? "Scanning..." : 
             health.status === "healthy" ? "Vault Link OK" : "Link Severed"}
          </span>
        </div>
        {isExpanded ? <ChevronDown className="w-3 h-3 text-white/20" /> : <ChevronUp className="w-3 h-3 text-white/20" />}
      </button>

      {/* Details View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3"
          >
            {/* Host Section */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Server className="w-3 h-3 text-white/20" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Core Node</span>
              </div>
              <code className="bg-white/5 px-2 py-1 rounded text-[9px] font-mono text-white/60 truncate italic">
                {health.host}
              </code>
            </div>

            {/* Latency Section */}
            <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Radio className="w-3 h-3 text-white/20" />
                <span className="text-[9px] font-bold text-white/40 uppercase">Latency</span>
              </div>
              <span className={`text-[10px] font-black font-mono ${
                health.latency && health.latency < 300 ? "text-emerald-400" : "text-gold"
              }`}>
                {health.latency ? `${health.latency}ms` : '--'}
              </span>
            </div>

            {/* Error Message */}
            {health.error && (
              <div className="text-[9px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 font-medium">
                ⚠️ {health.error}
              </div>
            )}

            {/* Last Check Time */}
            {health.lastChecked && (
              <div className="flex items-center justify-between text-[8px] text-white/20 font-bold uppercase">
                <span>Last Scan</span>
                <span>{health.lastChecked.toLocaleTimeString()}</span>
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={checkHealth}
              disabled={isChecking}
              className="w-full h-8 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-gold hover:text-black border border-white/5 transition-all"
            >
              {isChecking ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Re-Scan System"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
