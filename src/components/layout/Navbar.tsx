'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

// Navbar links animation variants
const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const linkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 }
};

// Mobile menu animation variants
const menuVariants = {
  closed: { 
    opacity: 0,
    height: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  },
  open: { 
    opacity: 1,
    height: 'auto',
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.05,
    }
  }
};

const menuItemVariants = {
  closed: { opacity: 0, y: -10 },
  open: { opacity: 1, y: 0 }
};

export const Navbar = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed w-full bg-black/90 backdrop-blur-md z-50 border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="https://cdn.discordapp.com/attachments/1208523842838859776/1356697749386559600/e9508943-b0b6-4141-8519-65e47123217b.png?ex=67ed82bd&is=67ec313d&hm=5eb435219772c28fb4fbd570625159deef7bae57fec985dece8bbe9c6d400462&" 
              alt="Vyrax Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <div className="text-xl font-bold tracking-tighter">
              <span className="text-white">VYRAX UNLIMITED</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <motion.div 
            className="hidden md:flex items-center space-x-8"
            initial="hidden"
            animate="visible"
            variants={navVariants}
          >
            <motion.div variants={linkVariants}>
              <Link href="/" className="text-white/90 hover:text-white">
                {t('nav.home')}
              </Link>
            </motion.div>
            <motion.div variants={linkVariants}>
              <Link href="/about" className="text-white/90 hover:text-white">
                {t('nav.about')}
              </Link>
            </motion.div>
            <motion.div variants={linkVariants}>
              <Link href="/services" className="text-white/90 hover:text-white">
                {t('nav.services')}
              </Link>
            </motion.div>
            <motion.div variants={linkVariants}>
              <Link href="/portfolio" className="text-white/90 hover:text-white">
                {t('nav.portfolio')}
              </Link>
            </motion.div>
            <motion.div variants={linkVariants}>
              <Link href="/contact" className="text-white/90 hover:text-white">
                {t('nav.contact')}
              </Link>
            </motion.div>
            <motion.div variants={linkVariants}>
              <LanguageSwitcher />
            </motion.div>
            <motion.div variants={linkVariants}>
              <Link 
                href="/contact" 
                className="px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                {t('home.hero.cta')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-white transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`w-full h-0.5 bg-white transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <div className="pt-4 pb-6 space-y-4">
                <motion.div variants={menuItemVariants}>
                  <Link 
                    href="/" 
                    className="block py-2 text-white/90 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.home')}
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link 
                    href="/about" 
                    className="block py-2 text-white/90 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.about')}
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link 
                    href="/services" 
                    className="block py-2 text-white/90 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.services')}
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link 
                    href="/portfolio" 
                    className="block py-2 text-white/90 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.portfolio')}
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link 
                    href="/contact" 
                    className="block py-2 text-white/90 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.contact')}
                  </Link>
                </motion.div>
                <motion.div variants={menuItemVariants}>
                  <Link 
                    href="/contact" 
                    className="inline-block mt-2 px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('home.hero.cta')}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}; 