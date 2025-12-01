import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { CoursePlayer } from './components/CoursePlayer';
import { Portfolio } from './components/Portfolio';
import { AdminPage } from './components/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { api } from './services/api';
import { User, Course, AuthResponse } from './types';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login = ({ setUser }: { setUser: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth.php', { email, password });
      localStorage.setItem('iaev_token', res.token);
      setUser(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover opacity-20 z-0"></div>
      <div className="glass p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">IAEV Online</h1>
          <p className="text-slate-400">Student Work Center</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 text-white focus:border-blue-500 outline-none" required />
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 text-white focus:border-blue-500 outline-none" required />
          </div>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50">
            {loading ? 'Authenticating...' : 'Access Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Course[]>('/courses.php').then(setCourses).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 p-8 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Learning Dashboard</h1>
        <p className="text-slate-400">Continue your education journey.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="glass rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="h-40 bg-black relative overflow-hidden">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${course.progress}%` }}></div>
                </div>
                <span className="text-xs text-blue-400 font-bold">{course.progress}%</span>
              </div>
              <button onClick={() => navigate(`/course/${course.id}`)} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                Continue Learning
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MainLayout = ({ user, children, onLogout }: { user: User, children: React.ReactNode, onLogout: () => void }) => (
  <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans">
    <Sidebar user={user} onLogout={onLogout} />
    <main className="ml-64 flex-1 h-screen overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </main>
  </div>
);

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  
  const handleLogout = () => {
    localStorage.removeItem('iaev_token');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        <Route path="/" element={<ProtectedRoute user={user}><MainLayout user={user!} onLogout={handleLogout}><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute user={user}><MainLayout user={user!} onLogout={handleLogout}><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute user={user}><MainLayout user={user!} onLogout={handleLogout}><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/course/:id" element={<ProtectedRoute user={user}><MainLayout user={user!} onLogout={handleLogout}><CoursePlayer /></MainLayout></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute user={user}><MainLayout user={user!} onLogout={handleLogout}><Portfolio /></MainLayout></ProtectedRoute>} />
        
        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRoles={['teacher', 'admin']}>
            <MainLayout user={user!} onLogout={handleLogout}><AdminPage /></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;