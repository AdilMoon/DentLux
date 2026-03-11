import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from '../components/Skeleton';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser, isLoading: authLoading } = useAuth();

  const registerSchema = z.object({
    fullName: z.string().min(2, t('auth.name')),
    email: z
      .string()
      .min(1, t('auth.email'))
      .email(t('contact.error_email'))
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(9, t('auth.error_password_min'))
      .refine(
        (val) => {
          const letters = (val.match(/[a-zA-Zа-яА-ЯёЁәӘіІңҢғҒүҮұҰқҚөӨһҺ]/g) || []).length;
          const digits = (val.match(/\d/g) || []).length;
          const special = (val.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
          return letters >= 6 && digits >= 2 && special >= 1;
        },
        {
          message: t('auth.error_password_min'),
        }
      ),
    phone: z
      .string()
      .regex(/^\+7\d{10}$/, t('contact.form_phone')),
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
    },
  });
  
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  // Обработчик для форматирования телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('7') && value.length > 0) {
      value = '7' + value;
    }
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    const formattedValue = value ? '+7' + value.slice(1) : '';
    onChange(formattedValue);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success(t('auth.success_register'));
      navigate('/contact');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || t('auth.error_register');
      toast.error(errorMessage);
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton height={60} />
          <Skeleton height={300} />
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
          <p className="text-primary-500 font-medium uppercase tracking-widest text-sm">{t('auth.register_subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-primary-900 p-10 border-4 border-primary-900 dark:border-primary-800 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)]">
          <h2 className="text-2xl font-black text-primary-900 dark:text-white mb-8 uppercase tracking-tighter italic">{t('auth.register_title')}</h2>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormInput
                name="fullName"
                label={t('auth.name')}
                type="text"
                placeholder={t('auth.name_placeholder')}
              />
              <FormInput
                name="email"
                label={t('auth.email')}
                type="email"
                placeholder="email@example.com"
              />
              <div>
                <label className="block text-sm font-black text-primary-900 dark:text-primary-100 uppercase tracking-widest mb-2">
                  {t('auth.phone')}
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <input
                        {...field}
                        type="tel"
                        placeholder="+77001234567"
                        maxLength={12}
                        onChange={(e) => handlePhoneChange(e, field.onChange)}
                        className={`w-full px-4 py-3 border-2 border-primary-900 dark:border-primary-800 dark:bg-primary-950 dark:text-white rounded-none focus:ring-0 focus:border-accent-600 outline-none transition-colors font-medium ${
                          error
                            ? 'border-red-500'
                            : 'border-primary-900 dark:border-primary-800'
                        }`}
                        aria-invalid={!!error}
                      />
                      {error && (
                        <p className="mt-1 text-sm text-red-600 font-bold" role="alert">
                          {error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <FormInput
                  name="password"
                  label={t('auth.password')}
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-accent-600 hover:bg-accent-700 text-white rounded-none py-4 font-black uppercase tracking-widest transition-all" isLoading={isSubmitting}>
                {t('auth.register_btn')}
              </Button>
            </form>
          </FormProvider>

          <div className="mt-10 pt-8 border-t-2 border-primary-50 dark:border-primary-800 text-center">
            <p className="text-sm font-bold text-primary-500 dark:text-primary-400 uppercase tracking-widest">
              {t('auth.have_account')}{' '}
              <Link to="/login" className="text-accent-600 hover:text-accent-700 underline transition-colors">
                {t('auth.login_btn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
