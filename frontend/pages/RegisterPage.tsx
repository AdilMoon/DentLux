
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { User, UserRole } from '../types';

interface RegisterPageProps {
  onRegister: (u: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onRegister({
        id: Math.random().toString(),
        name,
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
          <p className="text-gray-500">Жаңа аккаунт ашу</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Тіркелу</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Аты-жөні</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Мұрат Болат"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Рөл таңдау</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CLIENT)}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === UserRole.CLIENT ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Клиент
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.DOCTOR)}
                  className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === UserRole.DOCTOR ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Дәрігер
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={loading}>
              Тіркелу
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Аккаунтыңыз бар ма?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Кіру</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
