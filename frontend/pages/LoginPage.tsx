
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (u: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      let role = UserRole.CLIENT;
      if (email.includes('admin')) role = UserRole.ADMIN;
      if (email.includes('doctor')) role = UserRole.DOCTOR;

      onLogin({
        id: Math.random().toString(),
        name: role === UserRole.ADMIN ? 'Админ' : role === UserRole.DOCTOR ? 'Дәрігер Айдос' : 'Азамат Сапаров',
        email,
        role
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">DentReserve Pro</h1>
          <p className="text-gray-500">Клиника жүйесіне қош келдіңіз</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Жүйеге кіру</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Құпиясөз</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>
              Кіру
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Аккаунтыңыз жоқ па?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">Тіркелу</Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          Драйвер: admin@test.com / doctor@test.com / patient@test.com
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
