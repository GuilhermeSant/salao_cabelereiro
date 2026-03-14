import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Scissors, Clock, XCircle, MapPin, Loader2, User as UserIcon } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';

export default function EmployeeDashboard() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 5000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  useEffect(() => {
    if (currentUser) {
      fetchMyAgenda();
    }
  }, [currentUser]);

  const fetchMyAgenda = async () => {
    setIsLoading(true);
    try {
      // Para encontrar os appointments do funcionário de forma segura, usamos where
      const q = query(
        collection(db, 'appointments'),
        where('employeeId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setAppointments(list);
    } catch (err) {
      console.error(err);
      // Fallback pra query sem orderBy
      const fb = await getDocs(collection(db, 'appointments'));
      setAppointments(fb.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Atenção: Tem certeza que deseja cancelar o agendamento deste cliente?')) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      showSuccess('Agendamento cancelado com sucesso.');
      fetchMyAgenda();
    } catch (err) {
      showError('Erro ao cancelar agendamento.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white mb-2">Painel do <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Profissional</span></h1>
        <p className="text-neutral-400">Acompanhe e gerencie sua agenda diária de atendimentos.</p>
      </div>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-8 bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <CalendarDays className="text-amber-500" />
          Minha Agenda
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-2xl">
            <p className="text-neutral-400">Nenhum compromisso encontrado para a sua agenda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(app => (
              <div key={app.id} className="bg-neutral-950/50 border border-neutral-800 hover:border-amber-500/30 transition-colors rounded-2xl p-6 flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-start mb-4 border-b border-neutral-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                           <UserIcon size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Cliente</p>
                          <h3 className="text-white font-bold">{app.clientName || app.userName || 'Cliente Anônimo'}</h3>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${app.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {app.status === 'cancelled' ? 'Cancelado' : 'Confirmado'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-neutral-300">
                        <Scissors className="w-4 h-4 text-amber-500" />
                        <span>{app.service?.title || 'Serviço Estético'} - R$ {app.service?.price}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-300">
                        <CalendarDays className="w-4 h-4 text-amber-500" />
                        <span>{app.dateStr}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-300">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-white">{app.time}h</span>
                      </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-neutral-800">
                    {app.status !== 'cancelled' ? (
                       <button onClick={() => handleCancelAppointment(app.id)} className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-bold transition-all">
                         <XCircle size={16} /> Cancelar Horário
                       </button>
                    ) : (
                       <div className="w-full flex items-center justify-center gap-2 py-2 bg-neutral-900 border border-neutral-800 text-neutral-500 rounded-xl text-sm font-bold">
                         Horário Cancelado
                       </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
