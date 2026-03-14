import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Scissors, Users, CalendarDays, Shield, ShieldAlert, XCircle, ArrowUpCircle } from 'lucide-react';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, query, orderBy } from 'firebase/firestore';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('equipe'); // 'equipe', 'usuarios', 'agenda'

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState(null);

  // Estados Equipe
  const [barbers, setBarbers] = useState([]);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [barberName, setBarberName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Estados Usuários
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Estados Agenda
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Pegar Role Atual
  useEffect(() => {
    async function checkRole() {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(docRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        }
      } catch (err) {
        console.error("Erro ao checar role:", err);
      }
    }
    checkRole();
  }, [currentUser]);

  // Carregar dados baseado na aba
  useEffect(() => {
    if (activeTab === 'equipe') fetchBarbers();
    if (activeTab === 'usuarios') fetchUsers();
    if (activeTab === 'agenda') fetchAppointments();
  }, [activeTab]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 5000);
  };
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };

  // ====== LÓGICA DE EQUIPE ======
  const fetchBarbers = async () => {
    setIsLoadingBarbers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'barbers'));
      const barbersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarbers(barbersList);
    } catch (err) {
      console.error(err);
      showError("Erro ao carregar a lista de profissionais.");
    } finally {
      setIsLoadingBarbers(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    if (!file) return showError('Selecione uma imagem primeiro.');
    if (!barberName.trim()) return showError('Informe o nome do profissional.');

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      await addDoc(collection(db, 'barbers'), {
        name: barberName,
        photoUrl: imageUrl,
        createdAt: new Date().toISOString()
      });
      showSuccess('Profissional salvo com sucesso!');
      setFile(null);
      setPreviewUrl('');
      setBarberName('');
      fetchBarbers();
    } catch (err) {
      console.error(err);
      showError('Erro no upload ou permissões.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteBarber = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja apagar ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'barbers', id));
      showSuccess(`Profissional ${name} removido.`);
      fetchBarbers();
    } catch (err) {
      showError('Erro ao tentar remover profissional.');
    }
  };

  // ====== LÓGICA DE USUÁRIOS ======
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsersList(list);
    } catch (err) {
      console.error(err);
      showError("Erro ao carregar usuários.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleChangeRole = async (userId, newRole, currentRole, email) => {
    // Proteger conta do admin original
    if (email === 'razorguilherme@gmail.com') {
      return showError('Não é possível modificar o Super Admin original.');
    }
    // Subadmins não podem alterar admins
    if (userRole === 'subadmin' && currentRole === 'admin') {
      return showError('Você não tem permissão para alterar um Admin.');
    }

    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      showSuccess(`O usuário foi promovido/rebaixado para ${newRole}.`);
      fetchUsers();
    } catch (err) {
      showError('Erro ao alterar permissão.');
    }
  };

  const handleDeleteUser = async (userId, email, currentRole) => {
    if (email === 'razorguilherme@gmail.com') return showError('Super Admin protegido.');
    if (userRole === 'subadmin' && currentRole === 'admin') return showError('Permissão negada.');
    if (!window.confirm('Tem certeza que deseja excluir os dados DESTE usuário do Firestore? Ele perderá acesso ao App.')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      showSuccess('Usuário excluído do Firestore.');
      fetchUsers();
    } catch (err) {
      showError('Erro ao excluir usuário.');
    }
  };

  // ====== LÓGICA DE AGENDA GLOBAL ======
  const fetchAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      // Ordena por data de criação mais recente
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(list);
    } catch (err) {
      console.error(err);
      // Se não houver índice no Firebase, firebase jogará erro de compilação de Index no browser console, normal.
      // showError("Erro ao carregar agendamentos (Verifique a necessidade de criar index no Log).");
      
      // Fallback pra queries sem orderBy se precisar
      const qFb = await getDocs(collection(db, 'appointments'));
      setAppointments(qFb.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      showSuccess('Agendamento cancelado com sucesso.');
      fetchAppointments();
    } catch (err) {
      showError('Erro ao cancelar agendamento.');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Excluir este agendamento do banco para liberar o horário permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'appointments', id));
      showSuccess('Agendamento excluído.');
      fetchAppointments();
    } catch (err) {
      showError('Erro ao excluir agendamento.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Gestão</span>
          </h1>
          <p className="text-neutral-400">Gerencie a equipe, clientes e todos os agendamentos do salão.</p>
        </div>
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('equipe')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'equipe' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Scissors size={18} /> Equipe
          </button>
          
          <button 
            onClick={() => setActiveTab('usuarios')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'usuarios' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <Users size={18} /> Usuários
          </button>

          <button 
            onClick={() => setActiveTab('agenda')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'agenda' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
          >
            <CalendarDays size={18} /> Agenda Global
          </button>
        </div>
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

      {/* RENDERIZAÇÃO CONDICIONAL DAS ABAS */}
      
      {activeTab === 'equipe' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl sticky top-28">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="text-amber-500" />
                Novo Profissional
              </h2>
              <form onSubmit={handleAddBarber} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Nome do Profissional</label>
                  <input
                    type="text"
                    value={barberName}
                    onChange={(e) => setBarberName(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-700 bg-neutral-950/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Foto de Perfil</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-700 border-dashed rounded-xl hover:border-amber-500/50 transition-colors bg-neutral-950/30">
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-full border-2 border-amber-500" />
                      ) : (
                        <ImageIcon className="mx-auto h-12 w-12 text-neutral-500" />
                      )}
                      <div className="flex text-sm text-neutral-400 mt-4 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-neutral-800 rounded-md font-medium text-amber-500 hover:text-amber-400 px-3 py-1">
                          <span>Carregar um arquivo</span>
                          <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">PNG, JPG até 10MB</p>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isUploading} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-70">
                  {isUploading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Enviando...</> : 'Salvar Profissional'}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Scissors className="text-amber-500" />
                Equipe Atual
              </h2>
              {isLoadingBarbers ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
              ) : barbers.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-2xl">
                  <p className="text-neutral-400">Nenhum profissional cadastrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {barbers.map((barber) => (
                    <div key={barber.id} className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-neutral-600 transition-colors">
                      <img src={barber.photoUrl} alt={barber.name} className="w-16 h-16 rounded-full object-cover border-2 border-neutral-800 group-hover:border-amber-500 transition-colors" />
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{barber.name}</h3>
                        <p className="text-xs text-neutral-500 mt-1 truncate">ID: {barber.id}</p>
                      </div>
                      <button onClick={() => handleDeleteBarber(barber.id, barber.name)} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
           <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="text-amber-500" />
            Gestão de Contas (RBAC)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="lowercase tracking-wider border-b border-neutral-800 text-neutral-500 bg-neutral-950/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold">Email / Nome</th>
                  <th scope="col" className="px-6 py-4 font-bold text-center">Cargo Atual</th>
                  <th scope="col" className="px-6 py-4 font-bold text-center">Permissões Rápida</th>
                  <th scope="col" className="px-6 py-4 font-bold text-right">Ações de Risco</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingUsers ? (
                  <tr><td colSpan="4" className="text-center py-10"><Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" /></td></tr>
                ) : (
                  usersList.map(user => (
                    <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-bold">{user.name || 'Sem Nome'}</p>
                        <p className="text-neutral-500 text-xs">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : user.role === 'subadmin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : user.role === 'employee' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>
                           {user.role}
                         </span>
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-2">
                        {user.role !== 'admin' && (
                          <>
                            <button onClick={() => handleChangeRole(user.id, 'employee', user.role, user.email)} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg font-bold text-xs" title="Tornar Profissional (Agenda)">Funcio</button>
                            <button onClick={() => handleChangeRole(user.id, 'subadmin', user.role, user.email)} className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg font-bold text-xs">Subadmin</button>
                            <button onClick={() => handleChangeRole(user.id, 'client', user.role, user.email)} className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 px-3 py-1.5 rounded-lg font-bold text-xs">Cliente</button>
                          </>
                        )}
                        {user.role === 'admin' && <span className="text-neutral-500 text-xs italic">Imutável</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => handleDeleteUser(user.id, user.email, user.role)} disabled={user.role === 'admin'} className="text-neutral-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent">
                            <Trash2 className="w-5 h-5 inline-block"/>
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agenda' && (
         <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CalendarDays className="text-amber-500" />
            Agenda Global da Semana
          </h2>
          <div className="space-y-4">
            {isLoadingAppointments ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
            ) : appointments.length === 0 ? (
               <div className="text-center py-12 border-2 border-dashed border-neutral-800 rounded-2xl">
                  <p className="text-neutral-400">Nenhum agendamento encontrado no banco de dados.</p>
                </div>
            ) : (
              appointments.map(app => (
                <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-white text-lg">Data: {new Date(app.dateStr + 'T' + app.time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${app.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {app.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm">Cliente: <span className="text-white font-medium">{app.clientName || app.userName || 'Cliente Anônimo'}</span></p>
                    <p className="text-neutral-400 text-sm">Serviço: <span className="text-amber-500 font-medium">{app.serviceName || app.service?.title || 'Serviço'}</span> (R$ {app.price || app.service?.price || '0'})</p>
                    <p className="text-neutral-400 text-sm">Profissional Req: <span className="text-white">{app.employeeName || app.barberName || app.barber?.name || app.employeeId || app.barberId}</span></p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {app.status !== 'cancelled' && (
                      <button onClick={() => handleCancelAppointment(app.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                        <XCircle size={16}/> Cancelar Horário
                      </button>
                    )}
                    <button onClick={() => handleDeleteAppointment(app.id)} className="bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                      <Trash2 size={16}/> Excluir Registro
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
         </div>
      )}

    </div>
  );
}
