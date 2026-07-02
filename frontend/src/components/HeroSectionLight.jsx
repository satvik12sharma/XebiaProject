import React from 'react';
import { motion } from 'framer-motion';
import { Boxes } from './ui/background-boxes';

export function HeroSectionLight({ heroContent, formContent, footerContent }) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-orange-50 overflow-hidden selection:bg-amber-200">
      {/* Background Animated Grid */}
      <Boxes />
      
      {/* Background Glows */}
      <div className="absolute top-0 -translate-y-[20%] -translate-x-[10%] w-[60vw] h-[60vw] rounded-full bg-amber-400/20 blur-[120px] z-0 pointer-events-none" />
      <div className="absolute bottom-[10%] translate-x-[30%] right-0 w-[50vw] h-[50vw] rounded-full bg-pink-400/10 blur-[100px] z-0 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 pointer-events-none">
        
        {/* Left Side: Hero Text */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start text-left max-w-2xl w-full lg:w-1/2 pointer-events-auto"
        >
          {heroContent}
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end pointer-events-auto"
        >
          {formContent}
        </motion.div>
      </div>
      
      {/* Footer Features */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="relative z-10 mt-auto pb-10 w-full flex justify-center pointer-events-auto"
      >
        {footerContent}
      </motion.div>
    </div>
  );
}
