
import React, { useState } from 'react';
import { User, Appointment, AppointmentStatus } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import { MOCK_APPOINTMENTS } from '../constants';
import { CheckCircle, XCircle, LogOut, Search, Clock, Calendar as CalIcon } from 'lucide-react';

interface DoctorDashboardProps {
  user: User;
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const updateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-blue-600">DentReserve Pro</h1>
          <p className="text-sm text-gray-500">Дәрігер панелі: {user.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="text-red-500">
          <LogOut className="w-4 h-4 mr-2" /> Шығу
        </Button>
      </header>

      <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Бүгінгі қабылдаулар</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Клиент есімі..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {appointments.length > 0 ? appointments.map(app => (
            <Card key={app.id}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">{app.time}</span>
                    <h3 className="text-lg font-bold text-gray-900">{app.clientName}</h3>
                  </div>
                  <p className="text-gray-600 font-medium">{app.serviceName}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center"><CalIcon className="w-4 h-4 mr-1" /> {app.date}</span>
                    <span className="flex items-center font-semibold text-blue-600 underline">Медициналық карта</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {app.status === AppointmentStatus.PENDING ? (
                    <>
                      <Button variant="success" size="sm" onClick={() => updateStatus(app.id, AppointmentStatus.ARRIVED)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Келді
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => updateStatus(app.id, AppointmentStatus.MISSED)}>
                        <XCircle className="w-4 h-4 mr-1" /> Келмеді
                      </Button>
                    </>
                  ) : app.status === AppointmentStatus.ARRIVED ? (
                    <Button variant="primary" size="sm" onClick={() => updateStatus(app.id, AppointmentStatus.COMPLETED)}>
                      Емді аяқтау
                    </Button>
                  ) : (
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      app.status === AppointmentStatus.COMPLETED ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {app.status}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center py-20 text-gray-500 bg-white border border-dashed border-gray-300 rounded-xl">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Жазылулар жоқ
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
