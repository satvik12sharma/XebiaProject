import React from 'react';
import { motion } from 'framer-motion';

export function HeroSection({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  bottomImage,
  gridOptions,
}) {
  return (
    <div className="relative w-full overflow-hidden bg-white/40 backdrop-blur-sm rounded-2xl mb-8 border border-orange-200/50 shadow-sm">
      {/* Background Grid - firmly z-0 so it stays at the back, below text */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${gridOptions?.angle || 65}deg, ${gridOptions?.lightLineColor || '#f59e0b20'} 1px, transparent 1px), 
            linear-gradient(${180 - (gridOptions?.angle || 65)}deg, ${gridOptions?.lightLineColor || '#f59e0b20'} 1px, transparent 1px)
          `,
          backgroundSize: `${gridOptions?.cellSize || 50}px ${gridOptions?.cellSize || 50}px`,
          opacity: gridOptions?.opacity || 0.4,
        }}
      />
      
      {/* Content - z-10 so it's above the grid */}
      <div className="relative z-10 w-full px-6 py-16 flex flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight"
        >
          {title}
        </motion.h1>
        
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-semibold mb-4"
          >
            <span className="text-slate-700">{subtitle.regular}</span>
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {subtitle.gradient}
            </span>
          </motion.div>
        )}
        
        {description && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-slate-600 text-lg mb-8"
          >
            {description}
          </motion.p>
        )}
        
        {ctaText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button className="bg-amber-500 hover:bg-amber-600 text-white text-base font-bold py-3 px-8 rounded-xl transition-all shadow-md shadow-amber-500/20 inline-block tracking-wide">
              {ctaText}
            </button>
          </motion.div>
        )}
        
        {bottomImage && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 w-full max-w-4xl rounded-xl overflow-hidden border border-orange-200/50 shadow-xl shadow-amber-900/10"
          >
            <img 
              src={bottomImage.light} 
              alt="Preview" 
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
