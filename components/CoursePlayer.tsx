import React, { useState, useEffect, useCallback } from 'react';
import { PlayCircle, CheckCircle, Lock, AlertCircle, Award } from 'lucide-react';
import { Course, Lesson } from '../types';
import { api } from '../services/api';
import { GoogleGenAI } from "@google/genai";
import { useParams, useNavigate } from 'react-router-dom';

export const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || '0');

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // AI Tutor State
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Course>(`/courses.php?id=${courseId}`); 
      setCourse(data);
      
      // Auto-select first uncompleted lesson
      if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
        let found = false;
        for (const mod of data.modules) {
          for (const less of mod.lessons) {
            if (!less.is_completed) {
              setActiveLesson(less);
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) setActiveLesson(data.modules[0].lessons[0]);
      }
    } catch (err) {
      setError('Failed to load course content.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if(courseId) fetchCourseData();
  }, [fetchCourseData, courseId]);

  const handleLessonClick = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setAiResponse('');
    setShowAi(false);
  };

  const markComplete = async () => {
    if (!activeLesson || !course) return;

    try {
      await api.post('/progress.php', { lesson_id: activeLesson.id, completed: true });
      
      setCourse(prev => {
        if (!prev) return null;
        const newModules = prev.modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => l.id === activeLesson.id ? { ...l, is_completed: true } : l)
        }));
        return { ...prev, modules: newModules };
      });
    } catch (e) {
      console.error(e);
    }
  };

  const askAiTutor = async () => {
    if (!activeLesson) return;
    setIsThinking(true);
    setShowAi(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `I am a student learning about "${activeLesson.title}". The content is: ${activeLesson.content}. Can you explain this topic simply and give me a practical example?`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setAiResponse(response.text || "I couldn't generate an explanation right now.");
    } catch (e) {
      setAiResponse("AI Tutor is currently unavailable.");
    } finally {
      setIsThinking(false);
    }
  };

  const downloadCertificate = () => {
    // @ts-ignore
    if (window.jspdf) {
      // @ts-ignore
      const doc = new window.jspdf.jsPDF({ orientation: "landscape" });
      doc.setFontSize(40);
      doc.setTextColor(40, 40, 40);
      doc.text("CERTIFICATE OF COMPLETION", 148, 50, { align: "center" });
      
      doc.setFontSize(30);
      doc.setTextColor(59, 130, 246);
      doc.text("Valued Student", 148, 100, { align: "center" }); 
      
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(`Has successfully completed: ${course?.title}`, 148, 130, { align: "center" });
      
      doc.save("certificate.pdf");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-white">Loading Module...</div>;
  if (error) return <div className="text-red-400 p-8 text-center glass rounded-xl">{error}</div>;
  if (!course) return null;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.is_completed).length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      <div className="p-6 border-b border-white/10 flex justify-between items-center glass mb-4 rounded-xl">
        <div>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-400 hover:text-white mb-1">← Back to Dashboard</button>
          <h2 className="text-2xl font-bold text-white">{course.title}</h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 mb-1">Course Progress</div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-white font-bold">{progressPercent}%</span>
          </div>
          {progressPercent === 100 && (
            <button 
              onClick={downloadCertificate}
              className="mt-2 text-xs flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
            >
              <Award size={14} /> Download Certificate
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative group shadow-2xl">
            {activeLesson ? (
              activeLesson.type === 'video' ? (
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeLesson.video_url}?rel=0`}
                  title={activeLesson.title}
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Quiz Time!</h3>
                  <button onClick={markComplete} className="px-6 py-2 bg-blue-600 rounded-lg text-white">Start Quiz</button>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Select a lesson</div>
            )}
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-bold text-white">{activeLesson?.title}</h1>
              <div className="flex gap-2">
                 <button 
                  onClick={askAiTutor}
                  className="px-4 py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all flex items-center gap-2"
                >
                  ✨ AI Tutor
                </button>
                <button 
                  onClick={markComplete}
                  disabled={activeLesson?.is_completed}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeLesson?.is_completed 
                    ? 'bg-green-500/20 text-green-400 cursor-default' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {activeLesson?.is_completed ? 'Completed' : 'Mark as Complete'}
                </button>
              </div>
            </div>
            
            {showAi && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                  Gemini Tutor {isThinking && <span className="animate-pulse">...</span>}
                </h4>
                <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {isThinking ? "Thinking..." : aiResponse}
                </div>
              </div>
            )}

            <div className="prose prose-invert max-w-none text-slate-300">
               <p>{activeLesson?.content || "No description available."}</p>
            </div>
          </div>
        </div>

        <div className="w-80 glass rounded-xl overflow-hidden flex flex-col border border-white/10">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h3 className="font-bold text-white">Course Content</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-4">
            {course.modules.map((module) => (
              <div key={module.id}>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">{module.title}</h4>
                <div className="space-y-1">
                  {module.lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        activeLesson?.id === lesson.id 
                          ? 'bg-blue-600/20 border border-blue-500/50' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {lesson.is_completed ? <CheckCircle size={18} className="text-green-400 shrink-0" /> : <PlayCircle size={18} className="text-blue-400 shrink-0" />}
                      <span className={`text-sm truncate ${activeLesson?.id === lesson.id ? 'text-white' : 'text-slate-400'}`}>
                        {lesson.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};