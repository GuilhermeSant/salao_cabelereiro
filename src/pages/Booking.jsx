import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Scissors, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// Horários de funcionamento (Ex: 09:00 às 18:00)
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// Serviços hardcoded para o MVP (poderiam vir do Firestore no futuro)
const SERVICES = [
  { id: 'corte-masc', name: 'Corte Masculino', price: 80, duration: 60 },
  { id: 'corte-fem', name: 'Corte Feminino', price: 150, duration: 60 },
  { id: 'mega-hair', name: 'Mega Hair', price: 500, duration: 120 },
  { id: 'barba', name: 'Barba Terapia', price: 45, duration: 60 }
];

export default function Booking() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Estados dos Dados Base
  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);

  // Estados das Seleções do Relógio
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  
  // Datas (Gera os próximos 14 dias disponíveis)
  const today = startOfDay(new Date());
  const availableDays = Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  const [selectedDate, setSelectedDate] = useState(today);
  
  // Horários e Disponibilidade
  const [selectedTime, setSelectedTime] = useState('');
  const [unavailableTimes, setUnavailableTimes] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Finalização
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Buscar barbeiros ao carregar
  useEffect(() => {
    async function fetchBarbers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'barbers'));
        const barbersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBarbers(barbersList);
        if (barbersList.length > 0) setSelectedBarber(barbersList[0]);
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
        setError("Não foi possível carregar os profissionais disponíveis.");
      } finally {
        setLoadingBarbers(false);
      }
    }
    fetchBarbers();
  }, []);

  // 2. Verificar disponibilidade de horários sempre que data ou barbeiro mudarem
  useEffect(() => {
    async function checkAvailability() {
      if (!selectedBarber || !selectedDate) return;

      setCheckingAvailability(true);
      setSelectedTime(''); // Reseta o horário selecionado quando mudar o dia
      
      try {
        // Formata a data para ISO YYYY-MM-DD para garantir a busca correta
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef, 
          where('barberId', '==', selectedBarber.id),
          where('dateStr', '==', dateStr),
          where('status', '==', 'confirmed')
        );

        const querySnapshot = await getDocs(q);
        const occupied = querySnapshot.docs.map(doc => doc.data().time);
        
        setUnavailableTimes(occupied);
      } catch (err) {
        console.error("Erro ao checar horários:", err);
        setUnavailableTimes([]); // Se der erro, assume livre (ou poderia bloquear tudo)
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkAvailability();
  }, [selectedBarber, selectedDate]);

  // 3. Função para salvar o Agendamento
  const handleBookingSubmit = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setError('Por favor, preencha todos os campos do agendamento.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Data ISO padronizada apenas com YYYY-MM-DD para busca exata
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Salvando no Firestore
      await addDoc(collection(db, 'appointments'), {
        userId: currentUser.uid,
        clientName: currentUser.displayName || currentUser.email?.split('@')[0],
        userEmail: currentUser.email,
        barberId: selectedBarber.id,
        employeeId: selectedBarber.id, // Adicionado para consistência de filtros do painel
        employeeName: selectedBarber.name,
        barberName: selectedBarber.name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        service: {
          title: selectedService.name,
          price: selectedService.price
        },
        price: selectedService.price,
        dateStr: dateStr, // string simplificada para queries rápidas
        time: selectedTime,
        status: 'confirmed',
        createdAt: new Date().toISOString() // timestamp ISO completo 
      });

      setSuccess(true);
      // Aqui você poderia redirecionar após 3s para "/meus-agendamentos"
      setTimeout(() => navigate('/meus-agendamentos'), 4000); 

    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      setError('Falha ao confirmar seu agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizações condicionais
  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-300 to-amber-600"></div>
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6 animate-in slide-in-from-bottom-4 duration-500" />
          <h2 className="text-3xl font-bold text-white mb-4">Agendamento Confirmado!</h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Seu horário com <strong className="text-amber-500">{selectedBarber?.name}</strong> foi reservado para 
            <br />
            <span className="text-white font-medium text-lg mt-2 inline-block">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
            </span>
          </p>
          <p className="text-sm text-neutral-500">Redirecionando para a página principal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Agendar <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Horário</span></h1>
        <p className="text-lg text-neutral-400">Escolha o serviço, o profissional e o melhor momento para você.</p>
      </div>

      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Filtros (Serviços e Barbeiros) e Data */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sessão: Serviços */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm">1</span>
              Escolha o Serviço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICES.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                    selectedService?.id === service.id 
                      ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                      : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg ${selectedService?.id === service.id ? 'text-amber-500' : 'text-white'}`}>
                      {service.name}
                    </h3>
                    <Scissors className={`w-5 h-5 ${selectedService?.id === service.id ? 'text-amber-500' : 'text-neutral-600'}`} />
                  </div>
                  <p className="text-neutral-400 text-sm font-medium">R$ {service.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sessão: Profissionais */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm">2</span>
              Escolha o Profissional
            </h2>
            
            {loadingBarbers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : barbers.length === 0 ? (
              <p className="text-neutral-500 italic py-4">Nenhum profissional cadastrado no momento.</p>
            ) : (
              <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
                {barbers.map(barber => (
                  <button
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber)}
                    className={`flex-shrink-0 w-36 sm:w-40 flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 snap-center ${
                      selectedBarber?.id === barber.id
                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <img 
                      src={barber.photoUrl || 'https://via.placeholder.com/150'} 
                      alt={barber.name} 
                      className={`w-20 h-20 rounded-full object-cover mb-4 border-2 transition-colors ${
                        selectedBarber?.id === barber.id ? 'border-amber-500' : 'border-neutral-800'
                      }`}
                    />
                    <h3 className={`text-sm font-bold text-center ${selectedBarber?.id === barber.id ? 'text-amber-500' : 'text-neutral-300'}`}>
                      {barber.name}
                    </h3>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Coluna da Direita: Data, Hora e Resumo (Sticky) */}
        <div className="space-y-8 lg:sticky lg:top-28 self-start">
          
          {/* Sessão: Calendário e Horários */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm">3</span>
              Data e Horário
            </h2>

            {/* Carrossel de Datas (Mobile-friendly) */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 text-neutral-400 text-sm font-medium uppercase tracking-wider">
                <CalendarIcon className="w-4 h-4" /> Próximos Dias
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                {availableDays.map(day => {
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all snap-start ${
                        isSelected 
                          ? 'bg-amber-500 border-amber-500 text-neutral-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                          : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-xs mb-1">{format(day, 'EEE', { locale: ptBR }).replace('.', '')}</span>
                      <span className="text-2xl leading-none">{format(day, 'dd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid de Horários */}
            <div>
               <div className="flex items-center gap-2 mb-4 text-neutral-400 text-sm font-medium uppercase tracking-wider">
                <Clock className="w-4 h-4" /> Horários
              </div>

              {checkingAvailability ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                  {TIME_SLOTS.map(time => {
                    const isOccupied = unavailableTimes.includes(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isOccupied}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                          isOccupied 
                            ? 'bg-neutral-950 border-neutral-900 text-neutral-600 cursor-not-allowed opacity-50'
                            : isSelected
                              ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                              : 'bg-neutral-950/50 border-neutral-700 text-white hover:border-amber-500/50 hover:text-amber-400'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Checkout / Resumo */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Efeito luminoso sutil */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[64px]"></div>

            <h3 className="text-lg font-bold text-white mb-6">Resumo do Agendamento</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-3">
                <span className="text-neutral-400">Serviço</span>
                <span className="text-white font-medium">{selectedService?.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-3">
                <span className="text-neutral-400">Profissional</span>
                <span className="text-white font-medium">{selectedBarber?.name || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-3">
                <span className="text-neutral-400">Data e Hora</span>
                <span className="text-amber-500 font-bold">
                  {selectedTime 
                    ? `${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}`
                    : '---'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-400">Total</span>
                <span className="text-2xl font-bold text-white">
                  R$ {selectedService?.price.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            <button
              onClick={handleBookingSubmit}
              disabled={isSubmitting || !selectedTime || !selectedBarber}
              className="w-full py-4 rounded-full font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
              ) : (
                'Confirmar Agendamento'
              )}
            </button>
            {!currentUser && (
               <p className="text-xs text-neutral-500 text-center mt-4">
                 Você será redirecionado para o login se não estiver autenticado.
               </p>
            )}
          </div>
        </div>

      </div>
       <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
