import React, { useEffect, useState } from 'react';
import { Users, Award, Heart, Target, Clock, CheckCircle, User, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { publicApi } from '../api/publicApi';
import { Doctor, Service } from '../types';
import { clinicInfo } from '../config/clinicInfo';
import Skeleton from '../components/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AboutPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: t('about.faq.q1'),
      answer: t('about.faq.a1')
    },
    {
      question: t('about.faq.q2'),
      answer: t('about.faq.a2')
    },
    {
      question: t('about.faq.q3'),
      answer: t('about.faq.a3')
    },
    {
      question: t('about.faq.q4'),
      answer: t('about.faq.a4')
    },
    {
      question: t('about.faq.q5'),
      answer: t('about.faq.a5')
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [doctorsData, servicesData] = await Promise.all([
          publicApi.getPublicDoctors(),
          publicApi.getPublicServices(),
        ]);
        setDoctors(doctorsData);
        setServices(servicesData);
      } catch (error) {
        console.error('Деректерді жүктеу қатесі:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero секция */}
      <section className="bg-primary-900 dark:bg-primary-950 text-white py-24 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter italic"
          >
            {t('about.title')}<span className="text-accent-600">.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-primary-300 max-w-3xl mx-auto font-light leading-relaxed"
          >
            {t('about.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* О клинике */}
      <section className="py-24 bg-white dark:bg-primary-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border-l-8 border-primary-900 dark:border-accent-600 pl-12 py-4"
            >
              <h2 className="text-4xl font-black text-primary-900 dark:text-white mb-8 uppercase tracking-tighter">
                {t('about.history_title')}
              </h2>
              <p className="text-xl text-primary-700 dark:text-primary-300 mb-6 font-medium leading-relaxed">
                {t('about.history_text1')}
              </p>
              <p className="text-xl text-primary-700 dark:text-primary-300 mb-6 font-medium leading-relaxed">
                {t('about.history_text2')}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-accent-500/20 rotate-3 rounded-none"></div>
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" 
                alt="Dental Clinic Interior" 
                className="relative z-10 w-full h-[400px] object-cover border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Миссия и ценности */}
      <section className="py-24 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-white p-12 border-2 border-primary-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex items-center mb-8">
                <Target className="w-10 h-10 text-accent-600 mr-4" />
                <h2 className="text-3xl font-black text-primary-900 uppercase tracking-tighter">{t('about.mission_title')}</h2>
              </div>
              <p className="text-lg text-primary-700 font-medium leading-relaxed">
                {t('about.mission_text')}
              </p>
            </div>
            <div className="bg-white p-12 border-2 border-primary-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="flex items-center mb-8">
                <Heart className="w-10 h-10 text-accent-600 mr-4" />
                <h2 className="text-3xl font-black text-primary-900 uppercase tracking-tighter">{t('about.values_title')}</h2>
              </div>
              <ul className="space-y-6 text-lg text-primary-700 font-bold uppercase tracking-wide">
                <li className="flex items-center border-b-2 border-primary-50 pb-2">
                  <span className="w-4 h-4 bg-accent-600 mr-4"></span>
                  {t('about.value1')}
                </li>
                <li className="flex items-center border-b-2 border-primary-50 pb-2">
                  <span className="w-4 h-4 bg-accent-600 mr-4"></span>
                  {t('about.value2')}
                </li>
                <li className="flex items-center border-b-2 border-primary-50 pb-2">
                  <span className="w-4 h-4 bg-accent-600 mr-4"></span>
                  {t('about.value3')}
                </li>
                <li className="flex items-center border-b-2 border-primary-50 pb-2">
                  <span className="w-4 h-4 bg-accent-600 mr-4"></span>
                  {t('about.value4')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-24 bg-primary-900 text-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-accent-600"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter italic">
                {clinicInfo.stats.yearsExperience}+
              </div>
              <div className="text-accent-500 text-xs font-black uppercase tracking-[0.2em]">{t('home.stats_experience')}</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter italic">
                {clinicInfo.stats.patientsCount.toLocaleString()}+
              </div>
              <div className="text-accent-500 text-xs font-black uppercase tracking-[0.2em]">{t('home.stats_patients')}</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter italic">
                {clinicInfo.stats.doctorsCount}
              </div>
              <div className="text-accent-500 text-xs font-black uppercase tracking-[0.2em]">{t('home.stats_doctors')}</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter italic">
                {clinicInfo.stats.servicesCount}+
              </div>
              <div className="text-accent-500 text-xs font-black uppercase tracking-[0.2em]">{t('home.all_services')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b-2 border-primary-900 pb-4">
            <h2 className="text-4xl font-black text-primary-900 uppercase tracking-tighter">
              {t('home.advantages_title')}
            </h2>
            <p className="text-primary-500 font-medium uppercase tracking-widest text-sm">{t('home.advantages_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {clinicInfo.advantages.map((advantage, index) => (
              <div
                key={index}
                className="bg-primary-50 p-8 rounded-none border-l-4 border-accent-600 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{advantage.icon}</div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 uppercase tracking-tight">
                  {advantage.title}
                </h3>
                <p className="text-primary-700 leading-relaxed font-medium">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="py-24 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-l-8 border-primary-900 pl-8">
            <h2 className="text-4xl font-black text-primary-900 uppercase tracking-tighter mb-4">
              {t('about.team_title')}
            </h2>
            <p className="text-primary-500 text-xl font-medium uppercase tracking-widest">
              {t('about.team_subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={400} className="rounded-none border-2 border-primary-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="group relative"
                >
                  <div className="aspect-[3/4] overflow-hidden border-2 border-primary-900 grayscale group-hover:grayscale-0 transition-all duration-500 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 bg-white">
                    {doctor.avatarUrl ? (
                      <img 
                        src={doctor.avatarUrl.startsWith('http') || doctor.avatarUrl.startsWith('/media/') ? doctor.avatarUrl : `${API_BASE_URL.replace('/api', '')}${doctor.avatarUrl}`} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100">
                        <User className="w-20 h-20 text-primary-300" />
                      </div>
                    )}
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-black text-primary-900 uppercase tracking-tighter group-hover:text-accent-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-accent-600 font-bold uppercase tracking-[0.2em] text-xs mt-2">
                      {doctor.specialization}
                    </p>
                    {doctor.experienceYears && (
                      <div className="mt-4 inline-block px-4 py-1 border border-primary-900 text-primary-900 dark:text-primary-100 text-[10px] font-black uppercase tracking-widest">
                        {t('home.experience')}: {doctor.experienceYears} {t('home.years')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Все услуги */}
      <section className="py-24 bg-white dark:bg-primary-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b-2 border-primary-900 dark:border-primary-100 pb-4">
            <h2 className="text-4xl font-black text-primary-900 dark:text-white uppercase tracking-tighter">
              {t('home.our_services')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 font-medium uppercase tracking-widest text-sm">{t('about.services_list_subtitle')}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} height={200} className="rounded-none border-2 border-primary-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-primary-900 p-8 border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                >
                  <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4 uppercase tracking-tight group-hover:text-accent-600 transition-colors">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-primary-600 dark:text-primary-400 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
                      {service.description}
                    </p>
                  )}
                  <div className="pt-4 border-t border-primary-100 dark:border-primary-800 flex items-center justify-between">
                    <span className="text-2xl font-black text-primary-900 dark:text-white tracking-tighter">
                      {service.price.toLocaleString()} <span className="text-sm font-bold uppercase tracking-widest ml-1 text-primary-400">₸</span>
                    </span>
                    <span className="text-[10px] font-black text-gray-400 dark:text-primary-500 uppercase tracking-widest">
                      {service.durationMinutes} {i18n.language === 'ru' ? 'мин' : 'мин'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* FAQ Секция */}
      <section className="py-24 bg-primary-900 dark:bg-primary-950 text-white overflow-hidden relative transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-600/10 -mr-48 -mt-48 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 border-l-8 border-accent-600 pl-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">
              {t('about.faq_title')}
            </h2>
            <p className="text-accent-500 text-sm font-black uppercase tracking-[0.3em]">
              {t('about.faq_subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`border-2 transition-all ${
                  openFaqIndex === index ? 'border-accent-600 bg-white/5' : 'border-primary-800 hover:border-primary-700'
                }`}
              >
                <button
                  className="w-full px-8 py-6 text-left flex justify-between items-center group"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <span className="text-lg font-bold uppercase tracking-tight group-hover:text-accent-500 transition-colors">
                    {faq.question}
                  </span>
                  <span className={`text-2xl font-black transition-transform duration-300 ${openFaqIndex === index ? 'rotate-45 text-accent-600' : 'text-primary-600'}`}>
                    +
                  </span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-8 pb-8 text-primary-300 font-medium leading-relaxed border-t border-primary-800 pt-6 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
