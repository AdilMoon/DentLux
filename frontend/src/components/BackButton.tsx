import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from './Button';

interface BackButtonProps {
  to?: string; // Опциональный путь для навигации, если не указан - использует navigate(-1)
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string; // Текст кнопки
  hideOnHome?: boolean; // Скрывать на главной странице
}

const BackButton: React.FC<BackButtonProps> = ({
  to,
  variant = 'ghost',
  size = 'sm',
  className = '',
  text = 'Артқа',
  hideOnHome = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Скрываем кнопку на главной странице, если hideOnHome = true
  if (hideOnHome && location.pathname === '/') {
    return null;
  }

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      // Если нет истории, идем на главную
      if (window.history.length <= 1) {
        navigate('/');
      } else {
        navigate(-1); // Возврат на предыдущую страницу в истории
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {text}
    </Button>
  );
};

export default BackButton;
