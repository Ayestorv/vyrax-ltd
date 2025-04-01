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
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

// Service box animation
const serviceBoxVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    y: -10,
    boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.05), 0 10px 10px -5px rgba(255, 255, 255, 0.01)",
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

export const ServicesSection = () => {
  const { t } = useTranslation();
  
  // Services data
  const services = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'services.webDesign.title',
      description: 'home.services.webDesign.description',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: 'services.webDevelopment.title',
      description: 'home.services.webDevelopment.description',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'services.mobileApps.title',
      description: 'home.services.mobileApps.description',
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      title: 'services.branding.title',
      description: 'home.services.branding.description',
    }
  ];
  
  return (
    <section className="py-20 px-4 sm:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[15%] w-64 h-64 bg-white/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto z-10 relative">
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">{t('home.services.title')}</h2>
          <div className="w-20 h-1 bg-white mx-auto rounded-full"></div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-black border border-white/10 rounded-xl p-8 flex flex-col items-center text-center hover:border-white/20 transition-all"
              variants={serviceBoxVariants}
              whileHover="hover"
            >
              <div className="mb-6 text-white">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{t(service.title)}</h3>
              <p className="text-white/70 mb-6">{t(service.description)}</p>
              <Link href="/services" className="mt-auto text-white hover:underline">
                {t('common.learnMore')} →
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}; 