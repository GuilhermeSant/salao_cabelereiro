import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ClientDashboard from './pages/ClientDashboard';
import Booking from './pages/Booking';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, RoleBasedRoute } from './components/ProtectedRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 flex flex-col">
          <Navbar />
          
          {/* Main Content Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              
              {/* Private Routes (Logged In Users Only) */}
              <Route path="/agendar" element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              } />

              <Route path="/meus-agendamentos" element={
                <PrivateRoute>
                  <ClientDashboard />
                </PrivateRoute>
              } />

              {/* Employee & Admin Routes */}
              <Route path="/employee" element={
                <RoleBasedRoute allowedRoles={['employee', 'admin', 'subadmin']}>
                  <EmployeeDashboard />
                </RoleBasedRoute>
              } />

              {/* Admin & Subadmin Routes */}
              <Route path="/admin" element={
                <RoleBasedRoute allowedRoles={['admin', 'subadmin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } />
              {/* Outras rotas serão adicionadas futuramente */}
              <Route path="/sobre" element={<div className="text-center py-20 text-2xl font-light">Sobre Nós</div>} />
              <Route path="/servicos" element={<div className="text-center py-20 text-2xl font-light">Serviços</div>} />
              <Route path="/agendar" element={<div className="text-center py-20 text-2xl text-amber-500 font-bold">Página de Agendamento em Construção</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
