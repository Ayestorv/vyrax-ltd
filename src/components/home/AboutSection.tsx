'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const AboutSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 px-4 sm:px-8 bg-white/[0.02] relative">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Image/Pattern Side */}
          <motion.div 
            className="w-full lg:w-1/2 relative h-[400px] sm:h-[500px]"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              duration: 0.6,
              type: 'spring',
              stiffness: 100,
              damping: 20
            }}
          >
            {/* Abstract grid pattern */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-4">
              {Array.from({ length: 25 }).map((_, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/10 rounded-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.05 * index,
                    duration: 0.4
                  }}
                />
              ))}
            </div>
            
            {/* Highlight boxes */}
            <motion.div 
              className="absolute top-[20%] left-[15%] w-36 h-36 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-center">
                <h4 className="text-4xl font-bold mb-1">10+</h4>
                <p className="text-white/70 text-sm">{t('home.about.experience')}</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-[15%] right-[10%] w-36 h-36 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="text-center">
                <h4 className="text-4xl font-bold mb-1">50+</h4>
                <p className="text-white/70 text-sm">{t('home.about.projects')}</p>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Text Side */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              duration: 0.6,
              type: 'spring',
              stiffness: 100,
              damping: 20
            }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">{t('home.about.title')}</h2>
            <div className="w-20 h-1 bg-white mb-8 rounded-full"></div>
            
            <p className="text-white/70 text-lg mb-8">
              {t('home.about.description')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-md mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">{t('home.about.innovativeDesign')}</h4>
                  <p className="text-white/70">{t('home.about.innovativeDesignDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-md mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">{t('home.about.technicalExcellence')}</h4>
                  <p className="text-white/70">{t('home.about.technicalExcellenceDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-md mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">{t('home.about.userFocused')}</h4>
                  <p className="text-white/70">{t('home.about.userFocusedDesc')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-md mr-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">{t('home.about.reliableSupport')}</h4>
                  <p className="text-white/70">{t('home.about.reliableSupportDesc')}</p>
                </div>
              </div>
            </div>
            
            <Link 
              href="/about" 
              className="inline-flex items-center px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              {t('common.learnMore')}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}; 