
import React, { useState } from 'react';
import { User } from '../types';
import Button from '../components/Button';
import { 
  Users, Stethoscope, Scissors, CalendarCheck, 
  CreditCard, RotateCcw, TrendingUp, Download, 
  LogOut, PieChart, Wallet
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const analyticsData = [
  { name: 'Дүй', табыс: 45000, шығын: 20000 },
  { name: 'Сей', табыс: 62000, шығын: 25000 },
  { name: 'Сәр', табыс: 58000, шығын: 22000 },
  { name: 'Бей', табыс: 75000, шығын: 30000 },
  { name: 'Жұм', табыс: 92000, шығын: 40000 },
  { name: 'Сен', табыс: 110000, шығын: 55000 },
  { name: 'Жек', табыс: 30000, шығын: 15000 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('analytics');

  const menuItems = [
    { id: 'doctors', icon: Stethoscope, label: 'Дәрігерлер' },
    { id: 'services', icon: Scissors, label: 'Қызметтер' },
    { id: 'appointments', icon: CalendarCheck, label: 'Жазылулар' },
    { id: 'payments', icon: CreditCard, label: 'Төлемдер' },
    { id: 'refunds', icon: RotateCcw, label: 'Қайтарымдар' },
    { id: 'expenses', icon: Wallet, label: 'Шығындар' },
    { id: 'analytics', icon: TrendingUp, label: 'Аналитика' },
  ];

  return (
    <div className="flex-1 flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600">DentReserve Pro</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Админ панелі</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                currentView === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Шығу
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {menuItems.find(m => m.id === currentView)?.label}
            </h2>
            <p className="text-gray-500">Клиниканың қазіргі жағдайы</p>
          </div>
          {currentView === 'analytics' && (
            <Button variant="secondary" size="md">
              <Download className="w-4 h-4 mr-2" /> Excel экспорт
            </Button>
          )}
        </div>

        {currentView === 'analytics' ? (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Жалпы Табыс', value: '1,245,000 ₸', change: '+12%', color: 'text-blue-600' },
                { label: 'Шығындар', value: '450,000 ₸', change: '-5%', color: 'text-red-600' },
                { label: 'Таза Пайда', value: '795,000 ₸', change: '+18%', color: 'text-green-600' },
                { label: 'Қайтарымдар', value: '15,000 ₸', change: '0%', color: 'text-gray-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-baseline justify-between">
                    <h4 className={`text-xl font-bold ${stat.color}`}>{stat.value}</h4>
                    <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-500' : stat.change === '0%' ? 'text-gray-400' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Апталық табыс пен шығын</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        cursor={{fill: '#F9FAFB'}}
                      />
                      <Bar dataKey="табыс" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={32} />
                      <Bar dataKey="шығын" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Пайда динамикасы</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="табыс" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
             "{menuItems.find(m => m.id === currentView)?.label}" бөлімі әзірленуде...
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
