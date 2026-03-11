
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { CheckCircle, ArrowLeft, Download, ShieldCheck } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Басты бетке қайту
        </Link>

        <Card className="text-center py-10">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-50 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Төлем сәтті өтті!</h1>
          <p className="text-gray-500 mb-8">Транзакция нөмірі: TXN-{id || '8842-X10'}</p>

          <div className="bg-gray-50 rounded-xl p-8 mb-8 text-left space-y-4 max-w-md mx-auto border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Қызмет атауы:</span>
              <span className="font-semibold text-gray-900 text-right">Тіс тазалау мен кеңес алу</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Уақыты:</span>
              <span className="font-semibold text-gray-900">20.05.2024, 14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Клиент:</span>
              <span className="font-semibold text-gray-900">Азамат Сапаров</span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Жалпы сома:</span>
              <span className="text-2xl font-bold text-blue-600">15,000 ₸</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto">
              <Download className="w-5 h-5 mr-2" /> PDF чек жүктеу
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Принтерден басып шығару
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>DentReserve Pro қауіпсіз төлем жүйесімен қорғалған</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
