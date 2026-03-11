import React from 'react';
import { AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-4 rounded-full">
            <AlertCircle className="w-16 h-16 text-gray-400" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Бет табылмады</h2>
        <p className="text-gray-600 mb-8">
          Кешіріңіз, сіз іздеген бет табылмады немесе жылжытылған.
        </p>
        <BackButton to="/" variant="primary" text="Басты бетке" />
      </div>
    </div>
  );
};

export default NotFoundPage;
