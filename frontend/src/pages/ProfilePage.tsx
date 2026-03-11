import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Shield, Save, Upload, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import FormInput from '../components/FormInput';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import { profileApi } from '../api/profileApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Аты-жөні міндетті'),
  email: z.string().email('Email дұрыс емес'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<{ avatarUrl?: string | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Загружаем профиль при монтировании
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await profileApi.getProfile();
        setProfile(profileData);
        methods.reset({
          fullName: profileData.fullName || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };
    loadProfile();
  }, [methods]);

  // Обновляем форму при изменении пользователя
  React.useEffect(() => {
    if (user) {
      methods.reset({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, methods]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      const updatedProfile = await profileApi.updateProfile({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
      });
      
      setProfile(updatedProfile);
      toast.success('Профиль сәтті жаңартылды');
      
      // Обновляем форму с новыми данными
      methods.reset({
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        phone: updatedProfile.phone || '',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Жаңарту қатесі';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Тек сурет файлдарын жүктеуге болады');
      return;
    }

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл өлшемі 5MB-тан аспауы керек');
      return;
    }

    try {
      setIsUploading(true);
      const updatedProfile = await profileApi.uploadAvatar(file);
      setProfile(updatedProfile);
      toast.success('Фото сәтті жүктелді');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Фото жүктеу қатесі';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Әкімші';
      case 'DOCTOR':
        return 'Дәрігер';
      case 'CLIENT':
        return 'Клиент';
      default:
        return 'Пайдаланушы';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">Пайдаланушы деректері жүктелуде...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <BackButton to="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Менің профилім</h1>
            <p className="text-gray-600 mt-2">Профиль ақпаратын өзгерту</p>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Card title="Жеке ақпарат">
              <div className="space-y-6">
                {/* Аватар/Иконка */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatarUrl ? (
                        <img 
                          src={`${API_BASE_URL.replace('/api', '')}${profile.avatarUrl}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-blue-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                      title="Фото жүктеу"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{getRoleLabel(user.role)}</span>
                    </div>
                  </div>
                </div>

                {/* Аты-жөні */}
                <div>
                  <FormInput
                    name="fullName"
                    label="Аты-жөні"
                    placeholder="Аты-жөніңізді енгізіңіз"
                    icon={User}
                  />
                </div>

                {/* Email */}
                <div>
                  <FormInput
                    name="email"
                    label="Электрондық пошта"
                    type="email"
                    placeholder="email@example.com"
                    icon={Mail}
                  />
                </div>

                {/* Телефон */}
                <div>
                  <FormInput
                    name="phone"
                    label="Телефон"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    icon={Phone}
                  />
                </div>

                {/* Роль (только для чтения) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Рөлі
                  </label>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900">{getRoleLabel(user.role)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Рөлді тек әкімші өзгерте алады</p>
                </div>

                {/* Кнопка сохранения */}
                <div className="pt-4">
                  <Button type="submit" isLoading={isSaving} size="lg">
                    <Save className="w-5 h-5 mr-2" />
                    Өзгерістерді сақтау
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </FormProvider>

        {/* Дополнительная информация */}
        <Card title="Қосымша ақпарат" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Пайдаланушы ID</span>
              <span className="text-gray-900 font-mono text-sm">{user.id}</span>
            </div>
            {user.role === 'CLIENT' && (
              <div className="pt-4">
                <Link to="/dashboard">
                  <Button variant="secondary" className="w-full">
                    Менің жазбаларым
                  </Button>
                </Link>
              </div>
            )}
            {user.role === 'DOCTOR' && (
              <div className="pt-4">
                <Link to="/dashboard">
                  <Button variant="secondary" className="w-full">
                    Менің жазбаларым
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
