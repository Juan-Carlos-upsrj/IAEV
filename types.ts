export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  video_url: string; // YouTube ID or MP4 URL
  content: string; // Markdown description
  order_index: number;
  is_completed: boolean;
  score?: number; // For quizzes
  type: 'video' | 'quiz';
}

export interface Module {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  progress: number; // Calculated percentage
  modules: Module[];
}

export interface Project {
  id: number;
  title: string;
  description: string;
  file_path: string;
  created_at: string;
}

export interface GradeRecord {
  quarter: string;
  course_name: string;
  grade: number;
  status: 'Pass' | 'Fail';
}

export interface AuthResponse {
  token: string;
  user: User;
}
