import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scissors, Menu, User, LogOut, ShieldAlert, X, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchRole() {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        } else {
          setUserRole('client'); // Default fallback
        }
      } else {
        setUserRole(null);
      }
    }
    fetchRole();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Falha ao fazer logout:", error);
    }
  }

  const handleNavigation = (e, targetId) => {
    e.preventDefault();
    setIsMenuOpen(false); // Fechar menu móvel se aberto

    if (location.pathname !== '/') {
      // Se não estiver na home, navega para home e anexa o hash
      navigate(`/${targetId}`);
    } else {
      // Se já estiver na home, faz o scroll direto
      const element = document.querySelector(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (targetId === '#home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <Scissors className="h-8 w-8 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider">
                Lumière
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#home" onClick={(e) => handleNavigation(e, '#home')} className="text-gray-300 hover:text-white hover:text-amber-400 transition-colors duration-200 font-medium">
                Home
              </a>
              <a href="#sobre" onClick={(e) => handleNavigation(e, '#sobre')} className="text-gray-300 hover:text-white hover:text-amber-400 transition-colors duration-200 font-medium">
                Sobre Nós
              </a>
              <a href="#servicos" onClick={(e) => handleNavigation(e, '#servicos')} className="text-gray-300 hover:text-white hover:text-amber-400 transition-colors duration-200 font-medium">
                Serviços
              </a>
              <a href="#contato" onClick={(e) => handleNavigation(e, '#contato')} className="text-gray-300 hover:text-white hover:text-amber-400 transition-colors duration-200 font-medium">
                Contato
              </a>
              
              {(userRole === 'admin' || userRole === 'subadmin') && (
                <Link to="/admin" className="text-amber-500 font-bold flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition-all">
                  <ShieldAlert size={16} /> Admin
                </Link>
              )}
              
              {userRole === 'employee' && (
                <Link to="/employee" className="text-amber-500 font-bold flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition-all">
                  <Scissors size={16} /> Minha Agenda
                </Link>
              )}
              
              {currentUser ? (
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Perfil" className="w-9 h-9 rounded-full border border-neutral-700 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/50 font-bold text-sm">
                        {currentUser.displayName?.[0] || currentUser.email?.[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-neutral-400 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                      Olá, <span className="text-white font-medium">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                    </span>
                  </div>
                  <Link to="/meus-agendamentos" className="text-gray-300 hover:text-amber-400 font-medium transition-colors">
                    Meus Agendamentos
                  </Link>
                  <Link to="/agendar" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap">
                    Agendar Horário
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-red-400 p-2 transition-colors rounded-full hover:bg-red-500/10"
                    title="Sair"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 ml-4">
                  <Link to="/login" className="flex items-center gap-2 text-white font-medium hover:text-amber-400 transition-colors duration-200">
                    <User className="w-5 h-5" />
                    Entrar
                  </Link>
                  <Link to="/login" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap">
                    Agendar Horário
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-neutral-900 border-b border-neutral-800 absolute w-full left-0 shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div className="flex flex-col space-y-3 px-2">
              <a href="#home" onClick={(e) => handleNavigation(e, '#home')} className="text-gray-300 hover:text-amber-400 font-medium py-2 border-b border-neutral-800">Home</a>
              <a href="#sobre" onClick={(e) => handleNavigation(e, '#sobre')} className="text-gray-300 hover:text-amber-400 font-medium py-2 border-b border-neutral-800">Sobre Nós</a>
              <a href="#servicos" onClick={(e) => handleNavigation(e, '#servicos')} className="text-gray-300 hover:text-amber-400 font-medium py-2 border-b border-neutral-800">Serviços</a>
              <a href="#contato" onClick={(e) => handleNavigation(e, '#contato')} className="text-gray-300 hover:text-amber-400 font-medium py-2 border-b border-neutral-800">Contato</a>
            </div>

            {(userRole === 'admin' || userRole === 'subadmin') && (
              <div className="px-2 pt-2">
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-amber-500 font-bold flex items-center gap-2 bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/30 w-full mb-2">
                  <ShieldAlert size={18} /> Painel Administrador
                </Link>
              </div>
            )}

            {userRole === 'employee' && (
              <div className="px-2 pt-2">
                <Link to="/employee" onClick={() => setIsMenuOpen(false)} className="text-amber-500 font-bold flex items-center gap-2 bg-amber-500/10 px-4 py-3 rounded-xl border border-amber-500/30 w-full mb-2">
                  <Scissors size={18} /> Minha Agenda
                </Link>
              </div>
            )}

            {currentUser && (
               <div className="px-2 pt-2 pb-2">
                <Link to="/meus-agendamentos" onClick={() => setIsMenuOpen(false)} className="text-white font-bold flex items-center gap-2 bg-neutral-800 px-4 py-3 rounded-xl w-full">
                  <Calendar size={18} className="text-amber-500" /> Meus Agendamentos
                </Link>
              </div>
            )}

            {!currentUser && (
              <div className="px-2 pt-2 grid grid-cols-2 gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 text-white font-medium bg-neutral-800 py-3 rounded-xl">
                  <User size={18} /> Entrar
                </Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 text-neutral-950 font-bold bg-amber-500 py-3 rounded-xl">
                  Agendar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
