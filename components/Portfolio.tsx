import React, { useState, useEffect } from 'react';
import { Upload, File, Trash2, ExternalLink, FileText, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';

export const Portfolio: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const fetchProjects = async () => {
    try {
      // In real implementation: GET /projects.php
      // Simulating empty initially
      const data = await api.get<Project[]>('/projects.php');
      setProjects(data);
    } catch (e) {
      console.log('Using simulated empty portfolio for demo');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const newProject = await api.upload<Project>('/upload.php', formData);
      setProjects([newProject, ...projects]);
      setMessage('Success: Project uploaded successfully!');
      form.reset();
    } catch (err) {
      setMessage('Error: Failed to upload project. Check file size/type.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/delete_project.php?id=${projectToDelete}`);
      setProjects(projects.filter(p => p.id !== projectToDelete));
      setMessage('Success: Project deleted.');
    } catch (e) {
      setMessage('Error: Failed to delete project.');
    } finally {
      setProjectToDelete(null);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto relative">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-2">Community Portfolio</h2>
        <p className="text-slate-400 mb-8">Share your work with the IAEV community. Uploads must be images or PDF.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="md:col-span-1">
            <div className="glass p-6 rounded-xl border border-white/10 sticky top-8">
              <h3 className="text-xl font-bold text-white mb-4">Upload Project</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Project Title</label>
                  <input name="title" required type="text" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none" placeholder="My Awesome Design" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea name="description" className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 outline-none h-24" placeholder="Briefly describe your project..." />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">File (Image/PDF)</label>
                  <div className="relative border-2 border-dashed border-white/20 rounded-lg p-4 hover:bg-white/5 transition-colors text-center cursor-pointer">
                    <input name="file" type="file" required accept=".jpg,.png,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload className="mx-auto text-blue-400 mb-2" />
                    <span className="text-xs text-slate-500">Click to select file</span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex justify-center items-center"
                >
                  {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : 'Upload to Portfolio'}
                </button>
                {message && <p className={`text-xs text-center ${message.startsWith('Success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="md:col-span-2 space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-12 glass rounded-xl">
                <File className="mx-auto text-slate-600 mb-4" size={48} />
                <p className="text-slate-400">No projects uploaded yet. Be the first!</p>
              </div>
            ) : (
              projects.map(proj => (
                <div key={proj.id} className="glass p-4 rounded-xl flex gap-4 items-start group hover:bg-white/5 transition-colors">
                  <div className="w-24 h-24 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                    {proj.file_path.endsWith('.pdf') ? (
                      <FileText className="text-red-400" size={32} />
                    ) : (
                      <img src={proj.file_path} alt={proj.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-white truncate">{proj.title}</h4>
                      <span className="text-xs text-slate-500 shrink-0 ml-2">{new Date(proj.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 mb-3 line-clamp-2">{proj.description}</p>
                    <div className="flex justify-between items-center">
                      <a 
                        href={proj.file_path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        View Full Project <ExternalLink size={12} />
                      </a>
                      <button 
                        onClick={() => setProjectToDelete(proj.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl transform scale-100 transition-all">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Delete Project?</h3>
            </div>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              Are you sure you want to delete this project? This action cannot be undone and the file will be permanently removed from your portfolio.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};