'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Form field type
type FormField = {
  value: string;
  error: string;
  touched: boolean;
};

// Form state type
type FormState = {
  name: FormField;
  email: FormField;
  phone: FormField;
  message: FormField;
};

export const ContactForm = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Form state initialization
  const [form, setForm] = useState<FormState>({
    name: { value: '', error: '', touched: false },
    email: { value: '', error: '', touched: false },
    phone: { value: '', error: '', touched: false },
    message: { value: '', error: '', touched: false },
  });

  // Update form fields
  const updateField = (field: keyof FormState, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        touched: true,
        error: validateField(field, value),
      }
    }));
  };

  // Validate a single field
  const validateField = (field: keyof FormState, value: string): string => {
    switch (field) {
      case 'name':
        return value.trim() === '' ? t('contact.validation.nameRequired') : '';
      case 'email':
        return value.trim() === '' 
          ? t('contact.validation.emailRequired') 
          : !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) 
            ? t('contact.validation.emailInvalid') 
            : '';
      case 'phone':
        return '';
      case 'message':
        return value.trim() === '' ? t('contact.validation.messageRequired') : '';
      default:
        return '';
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    let isValid = true;
    const newForm = { ...form };
    
    (Object.keys(form) as Array<keyof FormState>).forEach(field => {
      const error = validateField(field, form[field].value);
      newForm[field] = {
        ...newForm[field],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });
    
    setForm(newForm);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Create a unique ID for this form submission
      const formId = `form_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      
      // Send form data to the same API endpoint used by LiveChat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Use formId as sessionId to track the conversation
          sessionId: formId,
          // Send as a contact form submission with special formatting
          isContactForm: true,
          // Include all form fields
          message: form.message.value,
          userInfo: {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value || 'Not provided'
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      // Reset form on success
      setForm({
        name: { value: '', error: '', touched: false },
        email: { value: '', error: '', touched: false },
        phone: { value: '', error: '', touched: false },
        message: { value: '', error: '', touched: false },
      });
      
      setSubmitStatus('success');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Success message */}
      {submitStatus === 'success' && (
        <motion.div
          className="bg-white text-black p-4 rounded-lg mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-medium">{t('contact.success')}</p>
        </motion.div>
      )}
      
      {/* Error message */}
      {submitStatus === 'error' && (
        <motion.div
          className="bg-red-500 text-white p-4 rounded-lg mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="font-medium">{t('contact.error')}</p>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-white mb-1">
            {t('contact.name')}
          </label>
          <input 
            type="text"
            id="name"
            className={`w-full bg-white/10 border ${
              form.name.error && form.name.touched ? 'border-red-500' : 'border-white/20'
            } rounded-lg py-3 px-4 text-white placeholder-white/40`}
            placeholder={t('contact.name')}
            value={form.name.value}
            onChange={(e) => updateField('name', e.target.value)}
          />
          {form.name.error && form.name.touched && (
            <p className="mt-1 text-red-400 text-sm">{form.name.error}</p>
          )}
        </div>
        
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-white mb-1">
            {t('contact.email')}
          </label>
          <input 
            type="email"
            id="email"
            className={`w-full bg-white/10 border ${
              form.email.error && form.email.touched ? 'border-red-500' : 'border-white/20'
            } rounded-lg py-3 px-4 text-white placeholder-white/40`}
            placeholder={t('contact.email')}
            value={form.email.value}
            onChange={(e) => updateField('email', e.target.value)}
          />
          {form.email.error && form.email.touched && (
            <p className="mt-1 text-red-400 text-sm">{form.email.error}</p>
          )}
        </div>
        
        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-white mb-1">
            {t('contact.phone')} <span className="text-white/50 text-xs">(Optional)</span>
          </label>
          <input 
            type="tel"
            id="phone"
            className={`w-full bg-white/10 border ${
              form.phone.error && form.phone.touched ? 'border-red-500' : 'border-white/20'
            } rounded-lg py-3 px-4 text-white placeholder-white/40`}
            placeholder={t('contact.phone')}
            value={form.phone.value}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          {form.phone.error && form.phone.touched && (
            <p className="mt-1 text-red-400 text-sm">{form.phone.error}</p>
          )}
        </div>
        
        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-white mb-1">
            {t('contact.message')}
          </label>
          <textarea 
            id="message"
            rows={5}
            className={`w-full bg-white/10 border ${
              form.message.error && form.message.touched ? 'border-red-500' : 'border-white/20'
            } rounded-lg py-3 px-4 text-white placeholder-white/40`}
            placeholder={t('contact.message')}
            value={form.message.value}
            onChange={(e) => updateField('message', e.target.value)}
          />
          {form.message.error && form.message.touched && (
            <p className="mt-1 text-red-400 text-sm">{form.message.error}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <motion.button
          type="submit"
          className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="flex justify-center items-center">
              <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>{t('contact.sending')}</span>
            </div>
          ) : (
            t('contact.submit')
          )}
        </motion.button>
      </form>
    </div>
  );
}; 