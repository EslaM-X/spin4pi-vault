import { Keyboard, Command, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Shortcut {
  key: string;
  action: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative group w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 hover:border-gold/40 hover:bg-gold/10 transition-all duration-300"
          >
            <Keyboard className="w-5 h-5 text-white/40 group-hover:text-gold transition-colors" />
            {/* إضاءة خلفية صغيرة عند التحويم */}
            <div className="absolute inset-0 bg-gold/5 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </TooltipTrigger>
        
        <TooltipContent 
          side="bottom" 
          align="end" 
          className="p-0 bg-[#0d0d12] border-2 border-gold/20 shadow-[0_10px_40px_rgba(0,0,0,0.7)] rounded-[1.5rem] overflow-hidden min-w-[220px] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="bg-gold/10 px-4 py-3 border-b border-gold/10 flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
              Tactical Commands
            </p>
          </div>

          {/* Shortcuts List */}
          <div className="p-4 space-y-3">
            {shortcuts.map((shortcut, index) => (
              <motion.div 
                key={shortcut.key} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between gap-4 group/item"
              >
                <span className="text-[11px] font-bold text-white/40 group-hover/item:text-white/70 transition-colors uppercase tracking-tight">
                  {shortcut.action}
                </span>
                
                <div className="flex items-center gap-1">
                  <kbd className="min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-white/5 border-b-2 border-white/10 rounded text-[10px] font-black text-gold font-mono shadow-sm group-hover/item:border-gold/50 transition-all">
                    {shortcut.key}
                  </kbd>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Decor */}
          <div className="px-4 py-2 bg-white/[0.02] flex items-center justify-center gap-2">
            <Zap className="w-2.5 h-2.5 text-gold/30" />
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em]">
              Master the wheel
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
