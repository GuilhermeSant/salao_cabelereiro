import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Clock, Scissors, XCircle, Loader2, Calendar } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';

export default function ClientDashboard() {
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
      fetchHistory();
    }
  }, [currentUser]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const qFb = await getDocs(collection(db, 'appointments'));
      // Filtrando apenas os que pertencem a este UID do Cliente
      const myData = qFb.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(app => app.userId === currentUser.uid);
      // Ordenação temporal simples pra exibir
      const sorted = myData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAppointments(sorted);
    } catch (err) {
      console.error(err);
      showError('Erro ao buscar seu histórico de agendamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar seu agendamento? Ele não poderá ser desfeito.')) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      showSuccess('Agendamento cancelado com sucesso. O horário foi liberado.');
      fetchHistory();
    } catch (err) {
      showError('Erro ao cancelar agendamento.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-white mb-2">Meus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Agendamentos</span></h1>
        <p className="text-neutral-400">Acompanhe seus horários marcados e histórico no Salão Lumière.</p>
      </div>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-8 bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="text-amber-500" />
          Histórico e Futuros
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/30">
             <CalendarDays className="mx-auto w-12 h-12 text-neutral-700 mb-3"/>
            <p className="text-neutral-400 mb-4">Você ainda não realizou nenhum agendamento conosco.</p>
            <a href="/agendar" className="inline-block bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2 rounded-full transition-transform hover:-translate-y-0.5">
              Fazer Primeiro Agendamento
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map(app => (
              <div key={app.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:border-neutral-700">
                 <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center shrink-0">
                       <span className="text-amber-500 font-bold text-lg leading-tight">{app.dateStr.split('-')[2]}</span>
                       <span className="text-amber-500/70 text-xs font-bold leading-tight uppercase">{new Date(app.dateStr).toLocaleString('pt-BR', { month: 'short' }).replace('.','')}</span>
                    </div>
                    <div className="flex flex-col justify-center">
                       <h3 className="text-white font-bold text-lg flex items-center gap-2">
                         {app.serviceName || app.service?.title || 'Serviço Genérico'} 
                         <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${app.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                           {app.status === 'cancelled' ? 'Cancelado' : 'Confirmado'}
                         </span>
                        </h3>
                       <p className="text-neutral-400 text-sm flex items-center gap-2 mt-1">
                         <Clock size={14}/> {app.time}h • <Scissors size={14} className="ml-2"/> Profissional: {app.employeeName || app.barberName || app.barber?.name || app.employeeId || app.barberId}
                       </p>
                    </div>
                 </div>

                 <div className="flex shrink-0">
                    {app.status !== 'cancelled' && (
                      <button onClick={() => handleCancelAppointment(app.id)} className="w-full md:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 border border-neutral-800 hover:border-red-500/30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                        <XCircle size={16} /> Cancelar 
                      </button>
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
