import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp, Server } from "lucide-react";
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
      // Extract host from supabase URL
      const supabaseUrl = (supabase as any).supabaseUrl || 
        import.meta.env.VITE_SUPABASE_URL || 
        "unknown";
      
      let host = "unknown";
      try {
        host = new URL(supabaseUrl).hostname;
      } catch {
        host = supabaseUrl;
      }

      const { data, error } = await supabase.functions.invoke("get-leaderboard");
      const latency = Date.now() - startTime;

      if (error) {
        setHealth({
          status: "error",
          host,
          latency,
          lastChecked: new Date(),
          error: error.message || "Connection failed",
        });
      } else {
        setHealth({
          status: "healthy",
          host,
          latency,
          lastChecked: new Date(),
        });
      }
    } catch (err) {
      setHealth({
        status: "error",
        host: "unknown",
        latency: Date.now() - startTime,
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Check every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = {
    checking: "text-muted-foreground",
    healthy: "text-emerald-500",
    error: "text-destructive",
  };

  const statusBg = {
    checking: "bg-muted/50",
    healthy: "bg-emerald-500/10",
    error: "bg-destructive/10",
  };

  const StatusIcon = {
    checking: RefreshCw,
    healthy: CheckCircle2,
    error: XCircle,
  }[health.status];

  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-50 rounded-xl border ${statusBg[health.status]} backdrop-blur-sm shadow-lg`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Collapsed View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 w-full"
      >
        <StatusIcon 
          className={`w-4 h-4 ${statusColor[health.status]} ${
            health.status === "checking" || isChecking ? "animate-spin" : ""
          }`} 
        />
        <span className={`text-xs font-medium ${statusColor[health.status]}`}>
          {health.status === "checking" ? "Checking..." : 
           health.status === "healthy" ? "Backend OK" : "Backend Error"}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />
        ) : (
          <ChevronUp className="w-3 h-3 text-muted-foreground ml-auto" />
        )}
      </button>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/50"
          >
            <div className="px-3 py-3 space-y-3">
              {/* Host Info */}
              <div className="flex items-center gap-2 text-xs">
                <Server className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Host:</span>
                <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono truncate max-w-[150px]">
                  {health.host}
                </code>
              </div>

              {/* Latency */}
              {health.latency !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Latency:</span>
                  <span className={`font-mono ${
                    health.latency < 500 ? "text-emerald-500" :
                    health.latency < 1000 ? "text-amber-500" : "text-destructive"
                  }`}>
                    {health.latency}ms
                  </span>
                </div>
              )}

              {/* Error */}
              {health.error && (
                <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                  {health.error}
                </div>
              )}

              {/* Last Checked */}
              {health.lastChecked && (
                <div className="text-[10px] text-muted-foreground">
                  Last checked: {health.lastChecked.toLocaleTimeString()}
                </div>
              )}

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={checkHealth}
                disabled={isChecking}
                className="w-full text-xs h-7"
              >
                {isChecking ? (
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Refresh
              </Button>

              {/* Vercel Env Notice */}
              {health.status === "error" && (
                <p className="text-[10px] text-muted-foreground text-center">
                  If on Vercel, check VITE_SUPABASE_URL env var
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
