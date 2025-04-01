'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const CtaSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-24 px-4 sm:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent z-0"></div>
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[30%] w-80 h-80 bg-white/5 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-[20%] right-[30%] w-80 h-80 bg-white/5 rounded-full blur-[120px] opacity-70" />
      </div>
      
      <div className="container mx-auto z-10 relative max-w-4xl">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.6,
            type: 'spring',
            stiffness: 100,
            damping: 20
          }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            {t('home.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/contact" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                {t('common.getInTouch')}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/portfolio" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-white/20 rounded-full font-medium hover:bg-white/10 transition-colors"
              >
                {t('common.viewProjects')}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 