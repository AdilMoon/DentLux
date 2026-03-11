import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Award, Heart, ArrowRight, Phone, Clock, User, Stethoscope, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { publicApi } from '../api/publicApi';
import { Doctor, Service } from '../types';
import { clinicInfo } from '../config/clinicInfo';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const IconMap: Record<string, React.FC<any>> = {
  Award: Award,
  Stethoscope: Stethoscope,
  ShieldCheck: ShieldCheck,
  UserCheck: UserCheck,
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [doctorsData, servicesData] = await Promise.all([
          publicApi.getPublicDoctors(),
          publicApi.getPublicServices(),
        ]);
        setDoctors(doctorsData.slice(0, 6)); // Первые 6 докторов
        setServices(servicesData.slice(0, 8)); // Первые 8 услуг
      } catch (error) {
        console.error('Деректерді жүктеу қатесі:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-primary-950 transition-colors">
      {/* Hero секция */}
      <section className="bg-primary-900 dark:bg-primary-950 text-white py-24 relative overflow-hidden border-b-8 border-accent-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 tracking-tight uppercase">
              {t('home.hero_title')}
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-300 max-w-3xl mx-auto font-light">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/dashboard');
                  } else {
                    navigate('/register');
                  }
                }}
                className="bg-accent-600 text-white hover:bg-accent-700 rounded-none px-10 py-4 text-lg font-bold uppercase tracking-wider transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t('home.book_now')}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/about')}
                className="text-white border-primary-500 border-2 hover:bg-white/5 rounded-none px-10 py-4 text-lg font-bold uppercase tracking-wider transition-all"
              >
                {t('home.learn_more')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            {/* Добавленное видео */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-16 max-w-4xl mx-auto border-8 border-black shadow-[15px_15px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden relative group"
            >
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <video 
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/media/video_presentation.mp4" type="video/mp4" />
                  Ваш браузер не поддерживает видео.
                </video>
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md p-2 text-sm font-bold uppercase tracking-widest border-l-4 border-accent-500 pointer-events-none">
                  Virtual Tour / Виртуальный тур
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-20 bg-white dark:bg-primary-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-primary-900 dark:border-primary-100 pb-4">
            <h2 className="text-4xl font-black text-primary-900 dark:text-white uppercase tracking-tighter">
              {t('home.advantages_title')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 font-medium">{t('home.advantages_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {clinicInfo.advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-primary-50 dark:bg-primary-900 p-8 rounded-none border-l-4 border-accent-600 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="mb-6 text-primary-900 dark:text-accent-500 group-hover:text-accent-600 transition-colors">
                  {(() => {
                    const IconComponent = IconMap[advantage.icon as keyof typeof IconMap] || Award;
                    return <IconComponent className="w-10 h-10" strokeWidth={1.5} />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3 uppercase tracking-tight">
                  {advantage.title}
                </h3>
                <p className="text-primary-700 dark:text-primary-300 leading-relaxed font-medium">{advantage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section className="py-24 bg-primary-50 dark:bg-primary-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 border-l-8 border-primary-900 dark:border-accent-600 pl-8">
            <h2 className="text-4xl font-black text-primary-900 dark:text-white uppercase tracking-tighter mb-4">
              {t('home.our_services')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 text-xl font-medium uppercase tracking-widest">
              {t('home.services_subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={200} className="rounded-none border-2 border-primary-100" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-primary-950 p-8 rounded-none border-2 border-primary-900 dark:border-primary-800 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
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
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/about">
                  <Button variant="secondary" size="lg" className="rounded-none border-2 border-primary-900 dark:border-primary-100 px-12">
                    {t('home.all_services')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Доктора */}
      <section className="py-24 bg-white dark:bg-primary-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-right mb-16 border-r-8 border-accent-600 pr-8">
            <h2 className="text-4xl font-black text-primary-900 dark:text-white uppercase tracking-tighter mb-4">
              {t('home.our_doctors')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 text-xl font-medium uppercase tracking-widest">
              {t('home.doctors_subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={300} className="rounded-none border-2 border-primary-100" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white dark:bg-primary-900 border-2 border-primary-900 dark:border-primary-800 p-8 rounded-none hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors group text-center"
                  >
                    <div className="w-32 h-32 grayscale hover:grayscale-0 transition-all duration-500 border-4 border-primary-900 dark:border-primary-800 mx-auto mb-8 overflow-hidden bg-primary-100 dark:bg-primary-950">
                      {doctor.avatarUrl ? (
                        <img 
                          src={doctor.avatarUrl.startsWith('http') || doctor.avatarUrl.startsWith('/media/') ? doctor.avatarUrl : `${API_BASE_URL.replace('/api', '')}${doctor.avatarUrl}`} 
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-primary-300 dark:text-primary-700" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-primary-900 dark:text-white mb-2 uppercase tracking-tighter">
                      {doctor.name}
                    </h3>
                    <p className="text-accent-600 dark:text-accent-500 font-bold uppercase tracking-[0.2em] text-xs mb-6">
                      {doctor.specialization}
                    </p>
                    {doctor.experienceYears && (
                      <div className="inline-block px-4 py-1 border border-primary-900 dark:border-primary-700 text-primary-900 dark:text-primary-400 text-xs font-black uppercase tracking-widest">
                        {t('home.experience')}: {doctor.experienceYears} {t('home.years')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/about">
                  <Button variant="secondary" size="lg" className="rounded-none border-2 border-primary-900 dark:border-primary-100 px-12">
                    {t('home.all_doctors')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Галерея До/После */}
      <section className="py-24 bg-primary-50 dark:bg-primary-900 transition-colors overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-900/5 dark:bg-white/5 -skew-x-12 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16 border-l-8 border-primary-900 dark:border-accent-600 pl-8">
            <h2 className="text-4xl font-black text-primary-900 dark:text-white uppercase tracking-tighter mb-4">
              {t('home.work_results')}
            </h2>
            <p className="text-primary-500 dark:text-primary-400 text-xl font-medium uppercase tracking-widest">
              {t('home.patients_smiles')}
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <BeforeAfterSlider />
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="py-20 bg-primary-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-600/10 -mr-32 -mt-32 rotate-45"></div>
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

      {/* CTA секция */}
      <section className="py-24 bg-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black mb-8 uppercase tracking-tighter italic leading-tight">
            {t('home.contact_us_title')}
          </h2>
          <p className="text-xl mb-12 text-accent-100 font-medium">
            {t('home.contact_us_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/dashboard');
                } else {
                  navigate('/register');
                }
              }}
              className="bg-white text-primary-900 border-white hover:bg-primary-900 hover:text-white rounded-none px-12 font-black uppercase tracking-widest"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t('home.book_now')}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/contact')}
              className="text-white border-white border-2 hover:bg-white/10 rounded-none px-12 font-black uppercase tracking-widest"
            >
              <Phone className="w-5 h-5 mr-2" />
              {t('home.call_us')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
