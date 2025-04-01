'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

export const HeroSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="h-screen flex items-center justify-center px-4 sm:px-8 relative">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] right-[25%] w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[30%] left-[25%] w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Content */}
      <motion.div 
        className="max-w-5xl z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold leading-tight tracking-tighter mb-6">
            {t('home.hero.title')}
          </h1>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <p className="text-lg sm:text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact" className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors">
            {t('home.hero.cta')}
          </Link>
          <Link href="/portfolio" className="px-8 py-4 border border-white/20 rounded-full font-medium hover:bg-white/10 transition-colors">
            {t('common.viewProjects')}
          </Link>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}; 