import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Loader2 } from 'lucide-react';

// Restringe acesso apenas para usuários logados genéricos
export function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Restringe acesso baseado em um array de roles permitidos
export function RoleBasedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();
  const [hasRole, setHasRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function checkUserRole() {
      if (!currentUser) {
        setHasRole(false);
        return;
      }
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userRole = userSnap.data().role;
          if (allowedRoles.includes(userRole)) {
            setHasRole(true);
          } else {
            setHasRole(false);
          }
        } else {
          setHasRole(false);
        }
      } catch (error) {
        console.error("Erro ao verificar status de permissão:", error);
        setHasRole(false);
      }
    }

    checkUserRole();
  }, [currentUser, allowedRoles]);

  if (hasRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!hasRole) {
    // Redireciona para home ou painel respectivo
    return <Navigate to="/" replace />;
  }

  return children;
}
