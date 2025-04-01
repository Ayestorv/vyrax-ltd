'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  hover: {
    y: -15,
    boxShadow: "0 25px 30px -15px rgba(255, 255, 255, 0.05)",
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10
    }
  }
};

export default function ServicesPage() {
  const { t } = useTranslation();
  
  // Services data with more details than on the homepage
  const services = [
    {
      id: 'web-design',
      title: 'services.webDesign.title',
      description: 'services.webDesign.description',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      features: [
        'Responsive design for all devices',
        'User-centered UI/UX design',
        'Brand-aligned visual aesthetics',
        'Interactive prototypes',
        'Accessibility compliance',
        'Cross-browser compatibility'
      ],
      caseStudyLink: '/portfolio'
    },
    {
      id: 'web-development',
      title: 'services.webDevelopment.title',
      description: 'services.webDevelopment.description',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      features: [
        'Custom web application development',
        'CMS integration (WordPress, Shopify, etc.)',
        'E-commerce solutions',
        'API development and integration',
        'Database design and optimization',
        'Performance optimization and testing'
      ],
      caseStudyLink: '/portfolio'
    },
    {
      id: 'mobile-apps',
      title: 'services.mobileApps.title',
      description: 'services.mobileApps.description',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      features: [
        'Native iOS and Android development',
        'Cross-platform app development (React Native)',
        'App UI/UX design',
        'Push notification integration',
        'App analytics implementation',
        'App store optimization and submission'
      ],
      caseStudyLink: '/portfolio'
    },
    {
      id: 'branding',
      title: 'services.branding.title',
      description: 'services.branding.description',
      icon: (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      features: [
        'Logo design and brand identity',
        'Brand strategy development',
        'Style guide creation',
        'Marketing material design',
        'Social media asset creation',
        'Brand voice and messaging'
      ],
      caseStudyLink: '/portfolio'
    }
  ];
  
  // Process steps
  const processSteps = [
    {
      title: 'Discovery',
      description: 'We start by understanding your business, goals, and requirements through in-depth consultation.'
    },
    {
      title: 'Strategy',
      description: 'Based on our findings, we develop a comprehensive strategy tailored to your specific needs.'
    },
    {
      title: 'Design',
      description: 'Our design team creates innovative, user-focused designs that align with your brand identity.'
    },
    {
      title: 'Development',
      description: 'We build your solution using cutting-edge technologies and best development practices.'
    },
    {
      title: 'Testing',
      description: 'Rigorous testing ensures your product is robust, secure, and functions flawlessly.'
    },
    {
      title: 'Launch',
      description: 'We handle the deployment process, ensuring a smooth and successful launch.'
    },
    {
      title: 'Support',
      description: 'Our relationship continues with ongoing support, maintenance, and optimization.'
    }
  ];
  
  return (
    <div className="pt-32 pb-20 px-4 sm:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] right-[20%] w-80 h-80 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[30%] left-[15%] w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Hero Section */}
        <motion.div
          className="mb-24 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">{t('services.title')}</h1>
          <div className="w-20 h-1 bg-white mx-auto rounded-full mb-8"></div>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto">
            We offer comprehensive digital solutions to help businesses establish a strong online presence, 
            reach their target audience, and achieve their goals through innovative design and development.
          </p>
        </motion.div>
        
        {/* Services Section */}
        <motion.div
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
              variants={fadeIn}
            >
              <div className={`${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="text-white mb-6">{service.icon}</div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t(service.title)}</h2>
                <div className="w-16 h-1 bg-white rounded-full mb-8"></div>
                <p className="text-white/70 text-lg mb-8">
                  {t(service.description)}
                </p>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">What We Offer</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-white mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link 
                    href={service.caseStudyLink} 
                    className="inline-flex items-center px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                  >
                    View Case Studies
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
              
              <motion.div 
                className={`bg-white/[0.03] border border-white/10 rounded-2xl h-80 sm:h-96 flex items-center justify-center p-8 ${
                  index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                }`}
                whileHover={{ 
                  boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.1)"
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }}
              >
                <div className="text-center">
                  <div className="text-white/10 text-[180px] font-bold leading-none">
                    0{index + 1}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Our Process Section */}
        <motion.div
          className="mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Process</h2>
            <div className="w-16 h-1 bg-white mx-auto rounded-full mb-8"></div>
            <p className="text-white/70 text-lg max-w-3xl mx-auto">
              We follow a structured approach to deliver exceptional results for every project. Our process ensures 
              transparency, collaboration, and the highest quality outcomes.
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 sm:left-1/2 transform sm:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-white/20"></div>
            
            {/* Process steps */}
            <div className="space-y-12">
              {processSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className={`flex flex-col sm:flex-row gap-8 items-center relative ${
                    index % 2 === 0 ? 'sm:flex-row-reverse text-right' : 'text-left'
                  }`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.6,
                    delay: index * 0.1
                  }}
                >
                  {/* Step number */}
                  <div className="absolute left-0 sm:left-1/2 transform sm:-translate-x-1/2 w-6 h-6 rounded-full bg-white flex items-center justify-center z-10">
                    <div className="w-3 h-3 rounded-full bg-black"></div>
                  </div>
                  
                  {/* Step content */}
                  <div className={`sm:w-1/2 p-6 sm:p-8 bg-white/[0.03] border border-white/10 rounded-xl sm:mr-12 ml-10 sm:ml-0 ${
                    index % 2 === 0 ? 'sm:ml-12' : 'sm:mr-12'
                  }`}>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                  
                  {/* Placeholder for even spacing */}
                  <div className="hidden sm:block sm:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* CTA Section */}
        <motion.div
          className="bg-white/[0.03] border border-white/10 rounded-3xl p-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Contact us today to discuss your project requirements and discover how our services can help your business thrive in the digital landscape.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link 
              href="/contact" 
              className="inline-flex items-center px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              {t('common.getInTouch')}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 