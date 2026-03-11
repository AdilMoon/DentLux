import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner: React.FC = () => {
  return (
    <div className="bg-yellow-100 border-b border-yellow-400 text-yellow-800 px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>Интернет байланысы жоқ. Офлайн режимде жұмыс істейсіз.</span>
      </div>
    </div>
  );
};

export default OfflineBanner;
