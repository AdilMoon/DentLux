import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from '../components/Skeleton';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  
  const loginSchema = z.object({
    email: z.string().email(t('contact.error_email')),
    password: z.string().min(6, t('auth.error_password_min')),
  });
  
  type LoginFormData = z.infer<typeof loginSchema>;

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success(t('auth.success_login'));
      // Перенаправляем на главную страницу после успешного входа
      navigate('/', { replace: true });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || t('auth.error_login');
      toast.error(errorMessage);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton height={60} />
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-primary-900 dark:text-white mb-2 uppercase tracking-tighter italic">
            Dental Master<span className="text-accent-600">.</span>
          </h1>
          <p className="text-primary-500 font-medium uppercase tracking-widest text-sm">{t('auth.login_subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-primary-900 p-10 border-4 border-primary-900 dark:border-primary-800 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)]">
          <h2 className="text-2xl font-black text-primary-900 dark:text-white mb-8 uppercase tracking-tighter italic">{t('auth.login_title')}</h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormInput
                name="email"
                label={t('auth.email')}
                type="email"
                placeholder="email@example.com"
              />
              <FormInput
                name="password"
                label={t('auth.password')}
                type="password"
                placeholder="••••••••"
              />
              <Button type="submit" className="w-full bg-accent-600 hover:bg-accent-700 text-white rounded-none py-4 font-black uppercase tracking-widest transition-all" isLoading={isSubmitting}>
                {t('auth.login_btn')}
              </Button>
            </form>
          </FormProvider>

          <div className="mt-10 pt-8 border-t-2 border-primary-50 dark:border-primary-800 text-center">
            <p className="text-sm font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest">
              {t('auth.no_account')}{' '}
              <Link to="/register" className="text-accent-600 hover:text-accent-700 underline transition-colors">
                {t('auth.register_btn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
