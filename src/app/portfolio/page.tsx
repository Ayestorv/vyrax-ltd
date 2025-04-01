'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const projectCardVariants = {
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
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10
    }
  }
};

export default function PortfolioPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Example project data
  // In a real application, this would typically come from a CMS or API
  const projects = [
    {
      id: 'project-1',
      title: 'Eco E-Commerce Platform',
      category: 'e-commerce',
      description: 'A sustainable products marketplace with integrated payment processing and inventory management.',
      imageSrc: 'https://images.unsplash.com/photo-1613294326794-e7c74fe886e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe', 'Shopify API'],
      yearCompleted: '2023'
    },
    {
      id: 'project-2',
      title: 'Finance Dashboard',
      category: 'web-app',
      description: 'Interactive financial analytics dashboard for personal and business expense tracking.',
      imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['React', 'D3.js', 'Node.js', 'Express', 'MongoDB'],
      yearCompleted: '2023'
    },
    {
      id: 'project-3',
      title: 'Health & Fitness App',
      category: 'mobile-app',
      description: 'Cross-platform mobile application for fitness tracking, meal planning, and health analytics.',
      imageSrc: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['React Native', 'Redux', 'Firebase', 'Apple HealthKit', 'Google Fit API'],
      yearCompleted: '2022'
    },
    {
      id: 'project-4',
      title: 'Real Estate Platform',
      category: 'web-app',
      description: 'Property listing and management platform with virtual tours and interactive maps.',
      imageSrc: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Google Maps API'],
      yearCompleted: '2022'
    },
    {
      id: 'project-5',
      title: 'Creative Agency Rebrand',
      category: 'branding',
      description: 'Comprehensive brand refresh for a creative agency, including logo design, style guide, and marketing materials.',
      imageSrc: 'https://images.unsplash.com/photo-1601933470096-0e34634ffcde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['Adobe Creative Suite', 'Brand Strategy', 'Print Design', 'Digital Assets'],
      yearCompleted: '2023'
    },
    {
      id: 'project-6',
      title: 'Restaurant Ordering System',
      category: 'e-commerce',
      description: 'Digital menu and ordering system with kitchen integration and inventory management.',
      imageSrc: 'https://images.unsplash.com/photo-1597020642626-3c9b687eba70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['React', 'Node.js', 'Socket.io', 'MySQL', 'Stripe'],
      yearCompleted: '2021'
    },
    {
      id: 'project-7',
      title: 'Travel Companion App',
      category: 'mobile-app',
      description: 'Mobile application for travelers with itinerary planning, offline maps, and local recommendations.',
      imageSrc: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['Flutter', 'Dart', 'Firebase', 'Google Cloud Platform', 'MapBox API'],
      yearCompleted: '2021'
    },
    {
      id: 'project-8',
      title: 'Educational Platform',
      category: 'web-app',
      description: 'Learning management system with course creation, video streaming, and student progress tracking.',
      imageSrc: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      technologies: ['Angular', 'TypeScript', 'Express.js', 'MongoDB', 'AWS S3'],
      yearCompleted: '2022'
    }
  ];
  
  // Filter categories
  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'web-app', label: 'Web Apps' },
    { id: 'mobile-app', label: 'Mobile Apps' },
    { id: 'e-commerce', label: 'E-Commerce' },
    { id: 'branding', label: 'Branding' }
  ];
  
  // Filtered projects based on active filter
  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);
  
  return (
    <div className="pt-32 pb-20 px-4 sm:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[5%] right-[15%] w-80 h-80 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Hero Section */}
        <motion.div
          className="mb-20 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">{t('portfolio.title')}</h1>
          <div className="w-20 h-1 bg-white mx-auto rounded-full mb-8"></div>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto">
            Explore our portfolio of successful projects, showcasing our expertise in web development, 
            mobile applications, e-commerce solutions, and branding.
          </p>
        </motion.div>
        
        {/* Filter Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {categories.map(category => (
            <motion.button
              key={category.id}
              className={`px-6 py-3 rounded-full text-sm sm:text-base font-medium transition-colors ${
                activeFilter === category.id 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              onClick={() => setActiveFilter(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>
        
        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <AnimatePresence mode='wait'>
            {filteredProjects.map(project => (
              <motion.div
                key={project.id}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8 }}
                variants={projectCardVariants}
                whileHover="hover"
                className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden flex flex-col h-full"
              >
                <div className="relative h-64">
                  <Image 
                    src={project.imageSrc} 
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                      <p className="text-white/70 text-sm">{project.yearCompleted}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-grow">
                  <p className="text-white/70 mb-4">{project.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm uppercase tracking-wider text-white/50 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 pb-6 mt-auto">
                  <motion.button
                    className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('portfolio.viewProject')}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* If no projects match the filter */}
        {filteredProjects.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4">No projects found</h3>
            <p className="text-white/70">
              No projects match the selected filter. Please try another category.
            </p>
          </motion.div>
        )}
        
        {/* CTA Section */}
        <motion.div
          className="mt-24 bg-white/[0.03] border border-white/10 rounded-3xl p-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to bring your project to life?</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            Let&apos;s create something exceptional together. Our team is ready to help you achieve your digital goals.
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