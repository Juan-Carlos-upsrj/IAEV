export const API_BASE_URL = '/api'; // Relative path for shared hosting deployment

// This key is injected by the environment in the real app, but defined here for the AI Tutor component.
// In a real production build, this would not be hardcoded if using a backend proxy, 
// but for client-side Gemini usage as per prompt instructions, we access env.
export const GEMINI_API_KEY = process.env.API_KEY || ''; 

export const THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  background: '#0f172a'
};
