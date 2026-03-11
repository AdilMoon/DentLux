import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GalleryItem {
  id: number;
  titleKey: string;
  descKey: string;
  beforeImg: string;
  afterImg: string;
}

const galleryData: GalleryItem[] = [
  {
    id: 1,
    titleKey: 'home.gallery.whitening_title',
    descKey: 'home.gallery.whitening_desc',
    beforeImg: '/media/before_cleaning.jpg',
    afterImg: '/media/after_cleaning.jpg'
  },
  {
    id: 2,
    titleKey: 'home.gallery.veneers_title',
    descKey: 'home.gallery.veneers_desc',
    beforeImg: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1445510491599-c391e8046a68?auto=format&fit=crop&q=80&w=800'
  }
];

const BeforeAfterSlider: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = x - container.left;
    const position = Math.max(0, Math.min(100, (relativeX / container.width) * 100));
    
    setSliderPos(position);
  };

  const next = () => setCurrentIndex((prev) => (prev + 1) % galleryData.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + galleryData.length) % galleryData.length);

  const current = galleryData[currentIndex];

  return (
    <div className="w-full space-y-12">
      <div className="relative group select-none touch-none"
           onMouseMove={handleMove}
           onTouchMove={handleMove}
           onMouseDown={() => setIsResizing(true)}
           onMouseUp={() => setIsResizing(false)}
           onMouseLeave={() => setIsResizing(false)}
           onTouchStart={() => setIsResizing(true)}
           onTouchEnd={() => setIsResizing(false)}>
        
        <div 
          className="aspect-video relative overflow-hidden border-4 border-primary-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] transition-shadow"
          style={{ '--slider-width': sliderPos } as React.CSSProperties}
        >
          {/* After Image (Background) */}
          <img 
            src={current.afterImg} 
            alt="After" 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          
          {/* Before Image (Overlay) */}
          <div 
            className="absolute inset-0 h-full overflow-hidden pointer-events-none border-r-2 border-white/50"
            style={{ width: `${sliderPos}%` }}
          >
            <img 
              src={current.beforeImg} 
              alt="Before" 
              className="absolute inset-0 h-full object-cover max-w-none pointer-events-none"
              style={{ width: 'calc(100% * (100 / var(--slider-width)))', maxWidth: 'none' }} 
            />
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute inset-y-0 w-1 bg-white cursor-col-resize z-20 flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-10 h-10 bg-accent-600 rounded-none border-2 border-primary-900 flex items-center justify-center -translate-x-1/2 shadow-xl">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-4 bg-white/50"></div>
                <div className="w-0.5 h-4 bg-white/50"></div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-6 left-6 bg-primary-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest z-10">{t('common.before')}</div>
          <div className="absolute top-6 right-6 bg-accent-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest z-10">{t('common.after')}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="max-w-xl">
          <h3 className="text-3xl font-black text-primary-900 dark:text-white uppercase tracking-tighter mb-4 italic transition-colors">
            {t(current.titleKey)}
          </h3>
          <p className="text-primary-600 dark:text-primary-400 font-medium leading-relaxed transition-colors">
            {t(current.descKey)}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={prev}
            className="p-4 border-2 border-primary-900 dark:border-primary-100 dark:text-white hover:bg-primary-900 hover:text-white transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next}
            className="p-4 border-2 border-primary-900 dark:border-primary-100 dark:text-white hover:bg-primary-900 hover:text-white transition-all"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
