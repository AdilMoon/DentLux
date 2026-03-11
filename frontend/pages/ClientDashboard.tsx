
import React, { useState } from 'react';
import { User, Appointment, AppointmentStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import { MOCK_SERVICES, MOCK_DOCTORS, MOCK_APPOINTMENTS, MOCK_PAYMENTS } from '../constants';
import { Calendar, Clock, User as UserIcon, CreditCard, LogOut, ChevronRight, FileText } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'appointments' | 'payments'>('booking');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleBooking = () => {
    alert('Жазылу сәтті аяқталды!');
    setActiveTab('appointments');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-blue-600">DentReserve Pro</h1>
          <p className="text-sm text-gray-500">Сәлеметсіз бе, {user.name}!</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-500 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Шығу
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('booking')}
            className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'booking' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Онлайн жазылу
            {activeTab === 'booking' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'appointments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Менің қабылдауларым
            {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === 'payments' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Менің төлемдерім
            {activeTab === 'payments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        {activeTab === 'booking' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card title="1. Қызмет таңдау">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_SERVICES.map(service => (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedService === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.price.toLocaleString()} ₸</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="2. Дәрігер мен уақыт таңдау">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Дәрігер</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                      <option value="">Таңдаңыз...</option>
                      {MOCK_DOCTORS.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Күні</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Уақыты</label>
                      <select 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      >
                        <option value="">Таңдаңыз...</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card title="Қорытынды">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Қызмет:</span>
                    <span className="font-medium text-right">{MOCK_SERVICES.find(s => s.id === selectedService)?.name || 'Таңдалмады'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Дәрігер:</span>
                    <span className="font-medium text-right">{MOCK_DOCTORS.find(d => d.id === selectedDoctor)?.name || 'Таңдалмады'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Уақыты:</span>
                    <span className="font-medium">{selectedDate || '-'} {selectedTime}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-base font-semibold">Жалпы сома:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {MOCK_SERVICES.find(s => s.id === selectedService)?.price.toLocaleString() || 0} ₸
                    </span>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleBooking}
                    disabled={!selectedService || !selectedDoctor || !selectedDate || !selectedTime}
                  >
                    Жазылуды растау
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {MOCK_APPOINTMENTS.map(app => (
              <Card key={app.id}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Calendar className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{app.serviceName}</h4>
                      <p className="text-gray-500 text-sm">{app.doctorName}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {app.date}</span>
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {app.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {app.status}
                    </span>
                    {app.status !== AppointmentStatus.COMPLETED && (
                      <Button variant="danger" size="sm">Күшін жою</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="overflow-hidden bg-white border border-gray-100 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Қызмет</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Уақыты</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сома</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Әрекет</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_PAYMENTS.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.serviceName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{payment.amount.toLocaleString()} ₸</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <FileText className="w-4 h-4 mr-1" /> Чек
                      </Button>
                      <button className="text-red-500 hover:text-red-700 text-xs font-semibold">Қайтарым сұрау</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
