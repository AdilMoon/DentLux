import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import Skeleton from '../components/Skeleton';
import { CheckCircle, Download, ShieldCheck } from 'lucide-react';
import { paymentsApi } from '../api';
import { Payment } from '../types';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  const loadPayment = async () => {
    // В реальном приложении здесь будет загрузка платежа по ID
    // Пока используем заглушку
    setLoading(false);
    setPayment({
      id: id || '',
      appointmentId: '',
      serviceName: 'Тіс тазалау мен кеңес алу',
      amount: 15000,
      date: new Date().toLocaleString('kk-KZ'),
      status: 'PAID' as any,
    });
  };

  const handleDownloadReceipt = async () => {
    if (!id) return;
    try {
      const blob = await paymentsApi.downloadReceipt(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Чек загружен');
    } catch (error) {
      toast.error('Ошибка загрузки чека');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <BackButton to="/dashboard" variant="ghost" text="Артқа" />
        </div>

        <Card className="text-center py-10">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-50 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Төлем сәтті өтті!</h1>
          <p className="text-gray-500 mb-8">Транзакция нөмірі: TXN-{id || '8842-X10'}</p>

          {payment && (
            <div className="bg-gray-50 rounded-xl p-8 mb-8 text-left space-y-4 max-w-md mx-auto border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Қызмет атауы:</span>
                <span className="font-semibold text-gray-900 text-right">{payment.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Уақыты:</span>
                <span className="font-semibold text-gray-900">{payment.date}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Жалпы сома:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {payment.amount.toLocaleString()} ₸
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto" onClick={handleDownloadReceipt}>
              <Download className="w-5 h-5 mr-2" /> PDF чек жүктеу
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={handlePrint}>
              Принтерден басып шығару
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>DentLux қауіпсіз төлем жүйесімен қорғалған</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
