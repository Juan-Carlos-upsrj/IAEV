import React, { useState } from 'react';
import { PlusCircle, Save } from 'lucide-react';
import { api } from '../services/api';

export const AdminPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [msg, setMsg] = useState('');

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses.php', {
        action: 'create_course',
        title,
        description: desc,
        thumbnail: 'https://picsum.photos/400/225' // Default for now
      });
      setMsg('Course created successfully!');
      setTitle('');
      setDesc('');
    } catch (err) {
      setMsg('Failed to create course.');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <PlusCircle size={24} className="text-blue-400" />
            Create New Course
          </h2>
          
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1 text-sm">Course Title</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 text-sm">Description</label>
              <textarea 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white h-32"
                required
              />
            </div>
            
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold flex justify-center items-center gap-2">
              <Save size={18} /> Save Course
            </button>
            {msg && <p className="text-center text-sm text-green-400">{msg}</p>}
          </form>
        </div>
        
        <div className="glass p-6 rounded-xl flex items-center justify-center text-slate-500">
          <p>More admin tools (Lesson Management) coming soon.</p>
        </div>
      </div>
    </div>
  );
};