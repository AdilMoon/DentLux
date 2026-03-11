import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { CheckCircle, XCircle, LogOut, Search, Clock, Calendar as CalIcon, FileText, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsApi } from '../api';
import { medicalRecordApi, MedicalRecord } from '../api/medicalRecordApi';
import { Appointment, AppointmentStatus, AppointmentStatusLabels } from '../types';
import { DIAGNOSIS_OPTIONS, TREATMENT_OPTIONS, PRESCRIPTION_OPTIONS } from '../config/medicalOptions';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Medical record modal
  const [medicalRecordModalOpen, setMedicalRecordModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  
  // Medical record form
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  
  // Состояния для выбранных значений в выпадающих списках
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState('');
  
  // Состояния для кастомного ввода (когда выбрано "Другое")
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [customTreatment, setCustomTreatment] = useState('');
  const [customPrescription, setCustomPrescription] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getDoctorAppointments();
      // Преобразуем данные для совместимости
      const transformed = data.map((app: any) => ({
        ...app,
        date: app.appointmentDate || app.date,
        time: app.appointmentTime || app.time,
      }));
      setAppointments(transformed);
    } catch (error) {
      toast.error('Жазылуларды жүктеу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await appointmentsApi.updateStatus(id, newStatus);
      toast.success('Статусы жаңартылды');
      await loadAppointments();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Статусты жаңарту қатесі';
      toast.error(errorMessage);
    }
  };

  const filteredAppointments = appointments.filter((app) =>
    app.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenMedicalRecord = async (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setMedicalRecordModalOpen(true);
    setLoadingRecord(true);
    
    try {
      const record = await medicalRecordApi.getByAppointmentId(appointmentId);
      if (record) {
        setMedicalRecord(record);
        const diag = record.diagnosis || '';
        const treat = record.treatment || '';
        const presc = record.prescriptions || '';
        
        // Проверяем, есть ли значение в списке вариантов
        if (diag) {
          if (DIAGNOSIS_OPTIONS.includes(diag)) {
            setSelectedDiagnosis(diag);
            setCustomDiagnosis('');
          } else {
            setSelectedDiagnosis('Басқа (Другое)');
            setCustomDiagnosis(diag);
          }
        } else {
          setSelectedDiagnosis('');
          setCustomDiagnosis('');
        }
        
        if (treat) {
          if (TREATMENT_OPTIONS.includes(treat)) {
            setSelectedTreatment(treat);
            setCustomTreatment('');
          } else {
            setSelectedTreatment('Басқа (Другое)');
            setCustomTreatment(treat);
          }
        } else {
          setSelectedTreatment('');
          setCustomTreatment('');
        }
        
        if (presc) {
          if (PRESCRIPTION_OPTIONS.includes(presc)) {
            setSelectedPrescription(presc);
            setCustomPrescription('');
          } else {
            setSelectedPrescription('Басқа (Другое)');
            setCustomPrescription(presc);
          }
        } else {
          setSelectedPrescription('');
          setCustomPrescription('');
        }
        
        setDiagnosis(diag);
        setTreatment(treat);
        setNotes(record.notes || '');
        setPrescriptions(record.prescriptions || '');
      } else {
        // Новая запись - предзаполняем диагноз из названия услуги
        setMedicalRecord(null);
        const appointment = appointments.find(app => app.id === appointmentId);
        const serviceName = appointment?.serviceName || '';
        
        // Предзаполняем диагноз названием услуги, если оно есть в списке
        if (serviceName && DIAGNOSIS_OPTIONS.includes(serviceName)) {
          setSelectedDiagnosis(serviceName);
          setCustomDiagnosis('');
          setDiagnosis(serviceName);
        } else if (serviceName) {
          // Если нет в списке, устанавливаем "Другое" и предзаполняем кастомное поле
          setSelectedDiagnosis('Басқа (Другое)');
          setCustomDiagnosis(serviceName);
          setDiagnosis(serviceName);
        } else {
          setSelectedDiagnosis('');
          setCustomDiagnosis('');
          setDiagnosis('');
        }
        
        setTreatment('');
        setNotes('');
        setPrescriptions('');
        setSelectedTreatment('');
        setSelectedPrescription('');
        setCustomTreatment('');
        setCustomPrescription('');
      }
    } catch (error: any) {
      toast.error('Медициналық жазбаны жүктеу қатесі');
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleSaveMedicalRecord = async () => {
    if (!selectedAppointmentId) return;

    try {
      setSavingRecord(true);
      
      // Определяем финальные значения: если выбрано "Другое", используем кастомный ввод
      const finalDiagnosis = selectedDiagnosis === 'Басқа (Другое)' ? customDiagnosis : (selectedDiagnosis || diagnosis);
      const finalTreatment = selectedTreatment === 'Басқа (Другое)' ? customTreatment : (selectedTreatment || treatment);
      const finalPrescriptions = selectedPrescription === 'Басқа (Другое)' ? customPrescription : (selectedPrescription || prescriptions);
      
      await medicalRecordApi.createOrUpdate(selectedAppointmentId, {
        diagnosis: finalDiagnosis || undefined,
        treatment: finalTreatment || undefined,
        notes: notes || undefined,
        prescriptions: finalPrescriptions || undefined,
      });
      toast.success('Медициналық жазба сақталды');
      await handleOpenMedicalRecord(selectedAppointmentId); // Перезагружаем данные
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Медициналық жазбаны сақтау қатесі';
      toast.error(errorMessage);
    } finally {
      setSavingRecord(false);
    }
  };

  const handleCloseMedicalRecord = () => {
    setMedicalRecordModalOpen(false);
    setSelectedAppointmentId(null);
    setMedicalRecord(null);
    setDiagnosis('');
    setTreatment('');
    setNotes('');
    setSelectedDiagnosis('');
    setSelectedTreatment('');
    setSelectedPrescription('');
    setCustomDiagnosis('');
    setCustomTreatment('');
    setCustomPrescription('');
    setPrescriptions('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <BackButton to="/" variant="ghost" />
          <div>
            <h1 className="text-xl font-bold text-blue-600">DentLux</h1>
            <p className="text-sm text-gray-500">Дәрігер панелі: {user?.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-red-500">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} height={120} />
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Жазылулар жоқ"
              description={searchQuery ? 'Клиент табылмады' : 'Бүгінгі қабылдаулар жоқ'}
            />
          ) : (
            filteredAppointments.map(app => (
              <Card key={app.id}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
                        {app.time}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{app.clientName}</h3>
                    </div>
                    <p className="text-gray-600 font-medium">{app.serviceName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <CalIcon className="w-4 h-4 mr-1" /> {app.date}
                      </span>
                      <button
                        onClick={() => handleOpenMedicalRecord(app.id)}
                        className="flex items-center font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Медициналық карта
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {app.status === AppointmentStatus.PENDING ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => updateStatus(app.id, AppointmentStatus.ARRIVED)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Келді
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => updateStatus(app.id, AppointmentStatus.MISSED)}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Келмеді
                        </Button>
                      </>
                    ) : app.status === AppointmentStatus.ARRIVED || app.status === AppointmentStatus.VISITED ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateStatus(app.id, AppointmentStatus.COMPLETED)}
                      >
                        Емді аяқтау
                      </Button>
                    ) : (
                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${
                          app.status === AppointmentStatus.COMPLETED || app.status === AppointmentStatus.DONE
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {AppointmentStatusLabels[app.status] || app.status}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Medical Record Modal */}
      <Modal
        isOpen={medicalRecordModalOpen}
        onClose={handleCloseMedicalRecord}
        title="Медициналық карта"
        size="lg"
      >
        {loadingRecord ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Диагноз
              </label>
              <select
                value={selectedDiagnosis}
                onChange={(e) => {
                  setSelectedDiagnosis(e.target.value);
                  if (e.target.value !== 'Басқа (Другое)') {
                    setDiagnosis(e.target.value);
                    setCustomDiagnosis('');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="">Таңдаңыз...</option>
                {DIAGNOSIS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {selectedDiagnosis === 'Басқа (Другое)' && (
                <textarea
                  value={customDiagnosis}
                  onChange={(e) => {
                    setCustomDiagnosis(e.target.value);
                    setDiagnosis(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Диагнозды енгізіңіз..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Емдеу
              </label>
              <select
                value={selectedTreatment}
                onChange={(e) => {
                  setSelectedTreatment(e.target.value);
                  if (e.target.value !== 'Басқа (Другое)') {
                    setTreatment(e.target.value);
                    setCustomTreatment('');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="">Таңдаңыз...</option>
                {TREATMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {selectedTreatment === 'Басқа (Другое)' && (
                <textarea
                  value={customTreatment}
                  onChange={(e) => {
                    setCustomTreatment(e.target.value);
                    setTreatment(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Емдеу процедураларын сипаттаңыз..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дәрі-дәрмектер
              </label>
              <select
                value={selectedPrescription}
                onChange={(e) => {
                  setSelectedPrescription(e.target.value);
                  if (e.target.value !== 'Басқа (Другое)') {
                    setPrescriptions(e.target.value);
                    setCustomPrescription('');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="">Таңдаңыз...</option>
                {PRESCRIPTION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {selectedPrescription === 'Басқа (Другое)' && (
                <textarea
                  value={customPrescription}
                  onChange={(e) => {
                    setCustomPrescription(e.target.value);
                    setPrescriptions(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Дәрі-дәрмектерді көрсетіңіз..."
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ескертпелер
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Қосымша ескертпелер..."
              />
            </div>

            {medicalRecord && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                Соңғы рет жаңартылған: {new Date(medicalRecord.updatedAt).toLocaleString('kk-KZ')}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseMedicalRecord}>
                Жабу
              </Button>
              <Button onClick={handleSaveMedicalRecord} isLoading={savingRecord}>
                <Save className="w-4 h-4 mr-2" />
                Сақтау
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
