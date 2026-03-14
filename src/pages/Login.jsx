import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scissors, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (!email || !password) {
      return setError('Por favor, preencha todos os campos.');
    }
    
    if (!isLogin && !name) {
      return setError('Por favor, informe seu nome.');
    }
    
    if (!isLogin && password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres.');
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Email ou senha incorretos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este email já está em uso.');
          break;
        default:
          setError('Falha ao autenticar. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Falha ao autenticar com o Google. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen -mt-20 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-700/10 rounded-full blur-[128px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center shadow-xl">
            <Scissors className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
          {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          {isLogin ? 'Ou ' : 'Já tem uma conta? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="font-medium text-amber-500 hover:text-amber-400 transition-colors focus:outline-none"
          >
            {isLogin ? 'cadastre-se agora' : 'faça login'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/80 backdrop-blur-xl py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-neutral-800">
           
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
                  Nome Completo
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-neutral-700 bg-neutral-950/50 rounded-xl shadow-sm placeholder-neutral-500 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                Endereço de Email
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-neutral-700 bg-neutral-950/50 rounded-xl shadow-sm placeholder-neutral-500 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="voce@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                Senha
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-neutral-700 bg-neutral-950/50 rounded-xl shadow-sm placeholder-neutral-500 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-neutral-700 rounded bg-neutral-900"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-400">
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
                    Esqueceu sua senha?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] text-sm font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-900 text-neutral-400">Ou continue com</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-neutral-700 rounded-xl shadow-sm text-sm font-medium text-white bg-neutral-950 hover:bg-neutral-800 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-neutral-500">
           <Link to="/" className="hover:text-amber-500 transition-colors">
               Voltar para Home
           </Link>
        </div>
      </div>
    </div>
  );
}
