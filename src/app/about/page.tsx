'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

export default function AboutPage() {
  const { t } = useTranslation();
  
  // Team members data
  const teamMembers = [
    {
      name: 'Jane Cooper',
      role: 'CEO & Founder',
      // For a real site, replace with actual images
      imageSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Over 15 years of experience in digital design and development.'
    },
    {
      name: 'Alex Morgan',
      role: 'Lead Designer',
      imageSrc: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Award-winning UI/UX designer with a passion for creating intuitive interfaces.'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Development',
      imageSrc: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Full-stack developer specializing in scalable web applications.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Marketing Director',
      imageSrc: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80',
      bio: 'Digital marketing expert with a focus on growth strategies and brand development.'
    }
  ];
  
  return (
    <div className="pt-32 pb-20 px-4 sm:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[15%] right-[20%] w-72 h-72 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[15%] w-80 h-80 bg-white/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Hero Section */}
        <motion.div
          className="mb-20 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">{t('about.title')}</h1>
          <div className="w-20 h-1 bg-white mx-auto rounded-full mb-8"></div>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto">
            At Vyrax, we combine technical expertise with creative vision to deliver exceptional digital experiences. 
            Our team of passionate designers and developers work collaboratively to bring innovative solutions to life.
          </p>
        </motion.div>
        
        {/* Mission Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={fadeIn} className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t('about.mission')}</h2>
            <div className="w-16 h-1 bg-white rounded-full mb-8"></div>
            <p className="text-white/70 text-lg mb-6">
              {t('about.missionText')}
            </p>
            <p className="text-white/70 text-lg">
              We strive to push the boundaries of what's possible in digital design and development, 
              creating solutions that not only look stunning but also deliver measurable results for our clients.
            </p>
          </motion.div>
          
          <motion.div 
            variants={fadeIn} 
            className="order-1 lg:order-2 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden h-[400px] relative"
          >
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2 p-4">
              {Array.from({ length: 16 }).map((_, index) => (
                <motion.div 
                  key={index}
                  className="bg-white/5 rounded-md w-full h-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: 0.03 * index,
                    duration: 0.4
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-black/60 backdrop-blur-sm p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-2">EST. 2014</h3>
                <p className="text-white/70">Excellence in digital solutions</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Values Section */}
        <motion.div 
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t('about.values')}</h2>
            <div className="w-16 h-1 bg-white mx-auto rounded-full mb-8"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white/[0.03] border border-white/10 p-8 rounded-xl"
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('about.value1')}</h3>
              <p className="text-white/70">
                We are committed to delivering excellence in every aspect of our work, from design and development to client communication and support.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/[0.03] border border-white/10 p-8 rounded-xl"
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('about.value2')}</h3>
              <p className="text-white/70">
                We constantly push the boundaries of what's possible, embracing new technologies and approaches to deliver cutting-edge solutions.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/[0.03] border border-white/10 p-8 rounded-xl"
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('about.value3')}</h3>
              <p className="text-white/70">
                We believe in the power of collaboration, working closely with our clients and each other to achieve the best possible outcomes.
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Team Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t('about.team')}</h2>
            <div className="w-16 h-1 bg-white mx-auto rounded-full mb-8"></div>
            <p className="text-white/70 text-lg max-w-3xl mx-auto mb-12">
              Our diverse team brings together expertise across design, development, and strategy to deliver exceptional digital solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(255, 255, 255, 0.05), 0 10px 10px -5px rgba(255, 255, 255, 0.01)" 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="h-64 relative">
                  <Image 
                    src={member.imageSrc} 
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-white/50 text-sm mb-4">{member.role}</p>
                  <p className="text-white/70">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 