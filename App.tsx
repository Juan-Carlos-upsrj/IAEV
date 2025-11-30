import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar } from './components/Sidebar';
import { CoursePlayer } from './components/CoursePlayer';
import { Portfolio } from './components/Portfolio';
import { api } from './services/api';
import { User, Course, AuthResponse } from './types';
import { LogIn, Mail, Lock } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false); // Set to true to check auth on mount in real app

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await api.post<AuthResponse>('/auth.php', { email, password });
      localStorage.setItem('iaev_token', res.token);
      setUser(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iaev_token');
    setUser(null);
    setSelectedCourseId(null);
    setActiveTab('dashboard');
  };

  // Mock Data for Dashboard View (When API isn't live in this environment)
  const dashboardCourses: Course[] = [
    {
      id: 1,
      title: "Introduction to React Development",
      description: "Learn the fundamentals of modern web development.",
      thumbnail: "https://picsum.photos/400/225",
      progress: 35,
      modules: []
    },
    {
      id: 2,
      title: "Database Design Mastery",
      description: "Understand SQL, normalization, and PHP integration.",
      thumbnail: "https://picsum.photos/400/226",
      progress: 0,
      modules: []
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover opacity-20 z-0"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="glass p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">IAEV Online</h1>
            <p className="text-slate-400">Student Work Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Student Email"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 text-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 text-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            {authError && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{authError}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Access Portal'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Protected System. Authorized Access Only.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={(t) => {
        setActiveTab(t);
        setSelectedCourseId(null);
      }} onLogout={handleLogout} />
      
      <main className="ml-64 flex-1 h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
        
        {selectedCourseId ? (
          <CoursePlayer courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
        ) : (
          <div className="h-full overflow-y-auto p-8 relative z-10">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}</h1>
                  <p className="text-slate-400">Continue where you left off.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardCourses.map(course => (
                    <div key={course.id} className="glass rounded-xl overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                      <div className="h-40 bg-black relative overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                        <p className="text-sm text-slate-400 mb-4">{course.description}</p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${course.progress}%` }}></div>
                          </div>
                          <span className="text-xs text-blue-400 font-bold">{course.progress}%</span>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedCourseId(course.id)}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                        >
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && <Portfolio />}
            
            {activeTab === 'kardex' && (
              <div className="glass p-8 rounded-xl">
                 <h2 className="text-2xl font-bold mb-6">Academic Record</h2>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-white/10 text-slate-400 text-sm">
                         <th className="p-3">Quarter</th>
                         <th className="p-3">Course</th>
                         <th className="p-3">Grade</th>
                         <th className="p-3">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-slate-200">
                       <tr className="border-b border-white/5">
                         <td className="p-3">Q1 2024</td>
                         <td className="p-3">Web Development I</td>
                         <td className="p-3 font-mono text-blue-400">95/100</td>
                         <td className="p-3"><span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Pass</span></td>
                       </tr>
                       <tr className="border-b border-white/5">
                         <td className="p-3">Q1 2024</td>
                         <td className="p-3">Database Fundamentals</td>
                         <td className="p-3 font-mono text-blue-400">88/100</td>
                         <td className="p-3"><span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Pass</span></td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
              </div>
            )}
            
            {/* Courses tab shares Dashboard view for now */}
            {activeTab === 'courses' && (
               <div className="text-center py-20">
                 <h2 className="text-xl text-slate-500">All courses listed in Dashboard</h2>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);