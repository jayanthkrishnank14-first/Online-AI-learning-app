export enum AppMode {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface LessonData {
  id: string;
  topic: string;
  rawTranscript: string;
  cleanedTranscript: string | null;
  summary: string | null;
  realLifeExamples: string[];
  examQuestions: ExamQuestion[];
  quiz: QuizQuestion[];
  isProcessing: boolean;
}

export interface ExamQuestion {
  question: string;
  marks: 3 | 4 | 5;
  type: 'Short' | 'Medium' | 'Long';
  answerKey: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Analytics Types
export interface StudentResult {
  lessonId: string;
  lessonTopic: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  usn: string;
  averageScore: number;
  lessonsCompleted: number;
  attendance: number; // Percentage
  quizHistory: StudentResult[];
}