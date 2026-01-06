import { Keyboard } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface Shortcut {
  key: string;
  action: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Keyboard className="w-5 h-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="p-3">
        <p className="font-semibold mb-2 text-foreground">Keyboard Shortcuts</p>
        <div className="space-y-1">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center gap-3 text-sm">
              <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                {shortcut.key}
              </kbd>
              <span className="text-muted-foreground">{shortcut.action}</span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
