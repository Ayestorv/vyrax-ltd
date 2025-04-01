'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  
  // This will handle client-side hydration safely
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Prevent hydration mismatch by using a simple initial state
  // and then updating after client-side hydration
  const buttonLabel = isMounted
    ? `Switch to ${i18n.language === 'en' ? 'Spanish' : 'English'}`
    : "Switch language";
  
  const buttonText = isMounted
    ? t('common.languageSwitcher')
    : i18n.language === 'en' ? 'EN' : 'ES';

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="px-3 py-1 text-sm font-medium border border-white/20 rounded-full hover:bg-white/10 transition-colors"
      onClick={toggleLanguage}
      aria-label={buttonLabel}
    >
      {buttonText}
    </motion.button>
  );
}; 