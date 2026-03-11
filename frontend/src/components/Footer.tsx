import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clinicInfo } from '../config/clinicInfo';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-primary-300 border-t-8 border-accent-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* О клинике */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-3xl font-black mb-6 uppercase tracking-tighter italic">
              {clinicInfo.fullName}<span className="text-accent-500">.</span>
            </h3>
            <p className="text-primary-400 mb-8 max-w-md leading-relaxed font-medium">
              {t('home.hero_subtitle')}
            </p>
            <div className="flex space-x-6">
              {clinicInfo.socialMedia.instagram && (
                <a
                  href={clinicInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-100 hover:text-accent-500 transition-colors font-bold uppercase tracking-widest text-xs border-b-2 border-accent-600 pb-1"
                >
                  Instagram
                </a>
              )}
              {clinicInfo.socialMedia.facebook && (
                <a
                  href={clinicInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-100 hover:text-accent-500 transition-colors font-bold uppercase tracking-widest text-xs border-b-2 border-accent-600 pb-1"
                >
                  Facebook
                </a>
              )}
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-sm border-l-4 border-accent-600 pl-4">{t('nav.quick_links')}</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="hover:text-accent-500 transition-colors uppercase tracking-widest text-xs font-bold">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-500 transition-colors uppercase tracking-widest text-xs font-bold">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent-500 transition-colors uppercase tracking-widest text-xs font-bold">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-sm border-l-4 border-accent-600 pl-4">{t('nav.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <MapPin className="w-5 h-5 flex-shrink-0 text-accent-600 group-hover:text-accent-400 transition-colors" />
                <span className="text-primary-300 font-medium">{clinicInfo.address}</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <Phone className="w-5 h-5 flex-shrink-0 text-accent-600 group-hover:text-accent-400 transition-colors" />
                <a
                  href={`tel:${clinicInfo.phone}`}
                  className="text-primary-300 hover:text-accent-500 transition-colors font-bold"
                >
                  {clinicInfo.phone}
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-accent-600 group-hover:text-accent-400 transition-colors" />
                <div className="text-primary-400 text-xs font-bold uppercase tracking-wider space-y-1">
                  <div>{clinicInfo.workingHours.weekdays}</div>
                  <div>{clinicInfo.workingHours.saturday}</div>
                  <div>{clinicInfo.workingHours.sunday}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="border-t border-primary-900 mt-16 pt-8 text-center text-primary-500 text-xs font-bold uppercase tracking-[0.2em]">
          <p>
            © {currentYear} {clinicInfo.name}. {t('footer.all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


