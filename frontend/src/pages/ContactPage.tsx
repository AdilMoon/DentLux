import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { clinicInfo } from '../config/clinicInfo';
import { contactApi } from '../api/contactApi';
import { formatPhoneNumber, getPhoneDigits } from '../utils/phoneMask';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contact_page.error_fill_all'));
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t('contact_page.error_email'));
      return;
    }

    try {
      setIsSubmitting(true);
      // Отправляем телефон в формате +7XXXXXXXXXX (только цифры)
      const phoneToSend = formData.phone && formData.phone.length > 4 ? getPhoneDigits(formData.phone) : undefined;
      
      await contactApi.submitMessage({
        name: formData.name,
        email: formData.email,
        phone: phoneToSend,
        message: formData.message,
      });
      
      toast.success(t('contact_page.success_msg'));
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || t('contact_page.error_send');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Специальная обработка для телефона
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData({
        ...formData,
        [name]: formatted,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero секция */}
      <section className="bg-primary-900 dark:bg-primary-950 text-white py-20 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter"
          >
            {t('contact_page.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-primary-300 max-w-3xl mx-auto font-light"
          >
            {t('contact_page.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Контактная информация */}
      <section className="py-24 bg-white dark:bg-primary-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            {/* Адрес */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-primary-50 dark:bg-primary-900 p-8 rounded-none border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] text-center"
            >
              <div className="w-16 h-16 bg-primary-900 dark:bg-accent-600 rounded-none flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-primary-900 dark:text-white mb-3 uppercase tracking-tighter">{t('contact_page.address_title')}</h3>
              <p className="text-primary-700 dark:text-primary-300 font-medium">{clinicInfo.address}</p>
            </motion.div>

            {/* Телефон */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-primary-50 dark:bg-primary-900 p-8 rounded-none border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] text-center"
            >
              <div className="w-16 h-16 bg-primary-900 dark:bg-accent-600 rounded-none flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-primary-900 dark:text-white mb-3 uppercase tracking-tighter">{t('contact_page.phone_title')}</h3>
              <a
                href={`tel:${clinicInfo.phone}`}
                className="text-accent-600 hover:text-accent-700 font-bold text-lg"
              >
                {clinicInfo.phone}
              </a>
            </motion.div>

            {/* Email */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-primary-50 dark:bg-primary-900 p-8 rounded-none border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] text-center"
            >
              <div className="w-16 h-16 bg-primary-900 dark:bg-accent-600 rounded-none flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-primary-900 dark:text-white mb-3 uppercase tracking-tighter">{t('contact_page.email_title')}</h3>
              <a
                href={`mailto:${clinicInfo.email}`}
                className="text-accent-600 hover:text-accent-700 font-bold text-lg"
              >
                {clinicInfo.email}
              </a>
            </motion.div>

            {/* Часы работы */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-primary-50 dark:bg-primary-900 p-8 rounded-none border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] text-center"
            >
              <div className="w-16 h-16 bg-primary-900 dark:bg-accent-600 rounded-none flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-primary-900 dark:text-white mb-3 uppercase tracking-tighter">{t('contact_page.working_hours_title')}</h3>
              <div className="text-primary-700 dark:text-primary-300 font-medium whitespace-pre-line space-y-1">
                  <p>{clinicInfo.workingHours.weekdays}</p>
                  <p>{clinicInfo.workingHours.saturday}</p>
                  <p>{clinicInfo.workingHours.sunday}</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Форма обратной связи */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-primary-900 p-10 border-4 border-primary-900 dark:border-primary-800 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)]"
            >
              <h2 className="text-3xl font-black text-primary-900 dark:text-white mb-8 uppercase tracking-tighter italic">
                {t('contact_page.form_title')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-widest mb-2">
                    {t('contact_page.form_name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-primary-900 dark:border-primary-800 dark:bg-primary-950 dark:text-white rounded-none focus:ring-0 focus:border-accent-600 outline-none transition-colors font-medium"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-widest mb-2">
                      {t('contact_page.form_email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-primary-900 dark:border-primary-800 dark:bg-primary-950 dark:text-white rounded-none focus:ring-0 focus:border-accent-600 outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-widest mb-2">
                      {t('contact_page.form_phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-primary-900 dark:border-primary-800 dark:bg-primary-950 dark:text-white rounded-none focus:ring-0 focus:border-accent-600 outline-none transition-colors font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-widest mb-2">
                    {t('contact_page.form_message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-primary-900 dark:border-primary-800 dark:bg-primary-950 dark:text-white rounded-none focus:ring-0 focus:border-accent-600 outline-none transition-colors font-medium resize-none"
                    required
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-accent-600 hover:bg-accent-700 text-white rounded-none py-4 font-black uppercase tracking-[0.2em] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  {isSubmitting ? t('contact_page.form_sending') : (
                    <span className="flex items-center justify-center">
                      {t('contact_page.form_send')}
                      <Send className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Карта */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[500px] border-4 border-primary-900 dark:border-primary-800 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2503.7744383416!2d71.4284!3d51.1284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDA3JzQyLjIiTiA3McKwMjUnNDIuMiJF!5e0!3m2!1sru!2skz!4v1620000000000!5m2!1sru!2skz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title={t('contact_page.map_title')}
                className="grayscale dark:invert transition-all"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
