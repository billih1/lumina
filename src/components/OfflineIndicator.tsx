import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 border border-amber-400/30 px-3 py-1.5 text-xs font-medium text-amber-300 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>Offline Mode — Full standalone torch active</span>
    </div>
  );
};
