import React, { useState, useEffect } from 'react';
import { LessonData, StudentResult, Appointment } from '../types';
import AssistantChat from './AssistantChat';
import ProgressMentor from './ProgressMentor';
import { BookOpenIcon, CheckCircleIcon, FileTextIcon, BrainCircuitIcon, PlayIcon, BarChartIcon, TrendingUpIcon, CalendarIcon, ClockIcon } from './Icons';
import { generateNotification } from '../services/geminiService';

interface StudentViewProps {
  lessons: LessonData[];
  activeLessonId: string | null;
  onSelectLesson: (id: string | null) => void;
  onNotification: (title: string, message: string, type: 'info' | 'alert' | 'success' | 'ai') => void;
  onTeacherAlert: (title: string, message: string) => void;
  onBookAppointment: (apt: Appointment) => void;
}

// Mock Data for Student Progress
const MOCK_HISTORY: StudentResult[] = [
  { lessonId: 'old-1', lessonTopic: 'Thermodynamics', score: 4, totalQuestions: 5, date: '2023-10-15' },
  { lessonId: 'old-2', lessonTopic: 'Kinematics', score: 3, totalQuestions: 5, date: '2023-10-20' },
  { lessonId: 'old-3', lessonTopic: 'Organic Chemistry', score: 5, totalQuestions: 5, date: '2023-10-25' },
  { lessonId: 'demo-1', lessonTopic: "Newton's 3rd Law", score: 4, totalQuestions: 5, date: '2023-11-01' },
];

const AVAILABLE_SLOTS = [
    "10:00 AM - 10:30 AM",
    "11:00 AM - 11:30 AM",
    "02:00 PM - 02:30 PM",
    "04:30 PM - 05:00 PM"
];

const StudentView: React.FC<StudentViewProps> = ({ lessons, activeLessonId, onSelectLesson, onNotification, onTeacherAlert, onBookAppointment }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'exam' | 'quiz' | 'progress' | 'schedule'>('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Appointment Form State
  const [selectedSlot, setSelectedSlot] = useState('');
  const [doubtTopic, setDoubtTopic] = useState('');
  
  // State to track which exam answers are visible
  const [visibleExamAnswers, setVisibleExamAnswers] = useState<Record<number, boolean>>({});

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  // Simulate AI Recommendation on Mount
  useEffect(() => {
    const timer = setTimeout(async () => {
        // Use Gemini to generate a dynamic notification
        const msg = await generateNotification("Student needs to review Kinematics due to low score", 'STUDENT');
        onNotification("AI Recommendation", msg, 'ai');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuizSubmit = () => {
    if (!activeLesson) return;
    let currentScore = 0;
    activeLesson.quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) currentScore++;
    });
    setScore(currentScore);
    setQuizSubmitted(true);
    
    // Notify the Teacher about the result
    onTeacherAlert("Quiz Result", `Student completed ${activeLesson.topic} with score ${currentScore}/${activeLesson.quiz.length}`);
    onNotification("Quiz Submitted", "Your results have been sent to your teacher.", "success");
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizStarted(false);
    setScore(0);
    setVisibleExamAnswers({});
  };

  const toggleExamAnswer = (index: number) => {
    setVisibleExamAnswers(prev => ({
        ...prev,
        [index]: !prev[index]
    }));
  };

  const handleBooking = () => {
      if(!selectedSlot || !doubtTopic.trim()) {
          alert("Please select a slot and enter a topic.");
          return;
      }
      
      const newApt: Appointment = {
          id: Date.now().toString(),
          studentName: "Current Student", // Mock
          topic: doubtTopic,
          timeSlot: selectedSlot,
          date: new Date().toLocaleDateString(),
          status: 'pending'
      };
      
      onBookAppointment(newApt);
      onNotification("Request Sent", "Your appointment request has been sent to the teacher.", "success");
      setDoubtTopic('');
      setSelectedSlot('');
  };

  if (!activeLessonId || !activeLesson) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6 mb-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Student Portal</h1>
                <p className="text-lg text-slate-500 max-w-2xl">Select a lesson to begin your AI-enhanced learning journey.</p>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    <CalendarIcon className="w-5 h-5" /> Schedule Doubt
                </button>
                <button 
                    onClick={() => setActiveTab('progress')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'progress' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                    <BarChartIcon className="w-5 h-5" /> My Progress
                </button>
            </div>
        </div>

        {activeTab === 'schedule' ? (
            <div className="animate-fade-in max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Book Doubt Clearing Session</h2>
                            <p className="text-slate-500">Select a time slot based on teacher availability.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Available Time Slots (Today)</label>
                            <div className="grid grid-cols-2 gap-3">
                                {AVAILABLE_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-4 rounded-xl border-2 font-medium transition-all ${selectedSlot === slot ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Doubt Topic / Question</label>
                            <textarea 
                                value={doubtTopic}
                                onChange={(e) => setDoubtTopic(e.target.value)}
                                className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:outline-none min-h-[100px]"
                                placeholder="Briefly describe what you need help with..."
                            />
                        </div>

                        <button 
                            onClick={handleBooking}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                            Request Appointment
                        </button>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <button onClick={() => setActiveTab('content')} className="text-indigo-600 font-bold hover:underline">
                        &larr; Back to Lessons
                    </button>
                </div>
            </div>
        ) : activeTab === 'progress' ? (
             <div className="animate-fade-in space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                 <TrendingUpIcon className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-sm text-slate-500 font-medium">Average Score</p>
                                 <p className="text-2xl font-black text-slate-900">
                                     {Math.round(MOCK_HISTORY.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / MOCK_HISTORY.length)}%
                                 </p>
                             </div>
                         </div>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                 <CheckCircleIcon className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-sm text-slate-500 font-medium">Quizzes Taken</p>
                                 <p className="text-2xl font-black text-slate-900">{MOCK_HISTORY.length}</p>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Bar Chart Container */}
                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                     <h2 className="text-xl font-bold text-slate-900 mb-6">Performance History</h2>
                     <div className="flex items-end gap-2 sm:gap-4 h-64 w-full">
                         {MOCK_HISTORY.map((item, idx) => {
                             const percentage = (item.score / item.totalQuestions) * 100;
                             return (
                                 <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                                     {/* Tooltip */}
                                     <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-lg transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                         {item.lessonTopic}: {item.score}/{item.totalQuestions}
                                     </div>
                                     <div 
                                        className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-indigo-500' : 'bg-orange-500'}`}
                                        style={{ height: `${percentage}%` }}
                                     ></div>
                                     <p className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center truncate w-full">{item.date}</p>
                                 </div>
                             );
                         })}
                     </div>
                 </div>

                 {/* AI Mentor Section */}
                 <ProgressMentor role="STUDENT" data={MOCK_HISTORY} />
                 
                 <button onClick={() => setActiveTab('content')} className="text-indigo-600 font-bold hover:underline">
                     &larr; Back to Lessons
                 </button>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {lessons.map((lesson) => (
                <button
                key={lesson.id}
                onClick={() => {
                    onSelectLesson(lesson.id);
                    resetQuiz();
                    setActiveTab('content');
                }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden"
                >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-3">
                        {lesson.quiz.length > 0 ? 'Ready to Learn' : 'Processing...'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {lesson.topic}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3">
                    {lesson.summary || "No summary available."}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Lesson &rarr;
                    </div>
                </div>
                </button>
            ))}
            
            {lessons.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                    <BrainCircuitIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p>No lessons available yet. Check back later!</p>
                </div>
            )}
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 pb-24 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <button 
            onClick={() => onSelectLesson(null)}
            className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors pl-1"
          >
            &larr; Back to Lessons
          </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-20 -mt-20 opacity-70 blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{activeLesson.topic}</h1>
            <p className="text-indigo-600 font-medium">Interactive Learning Module</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto sm:mx-0">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <BookOpenIcon className="w-4 h-4" /> Lesson Content
        </button>
        <button 
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'exam' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <FileTextIcon className="w-4 h-4" /> Exam Prep
        </button>
        <button 
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <CheckCircleIcon className="w-4 h-4" /> Take Quiz
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpenIcon className="w-4 h-4" />
                  </div>
                  Summary
                </h2>
                <div className="prose prose-indigo max-w-none text-slate-600 leading-relaxed text-lg">
                  {activeLesson.summary}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FileTextIcon className="w-4 h-4" />
                  </div>
                   Detailed Notes
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {activeLesson.cleanedTranscript}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-inner">
                <h3 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2">
                    <BrainCircuitIcon className="w-5 h-5 text-indigo-600" />
                    Real-Life Examples
                </h3>
                <div className="space-y-4">
                  {activeLesson.realLifeExamples.map((example, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-200 transition-colors">
                      <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md mb-2">Example {i + 1}</span>
                      <p className="text-slate-700 text-sm font-medium">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exam' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeLesson.examQuestions.map((q, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    q.marks === 1 || q.marks === 2 ? 'bg-green-100 text-green-700' :
                    q.marks === 3 ? 'bg-blue-100 text-blue-700' :
                    q.marks === 4 ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {q.marks} Mark{q.marks > 1 ? 's' : ''}
                  </span>
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{q.type} Answer</span>
                </div>
                <h3 className="font-medium text-slate-800 text-lg group-hover:text-indigo-900 transition-colors mb-4">{q.question}</h3>
                
                <div className="border-t border-slate-100 pt-4">
                    <button 
                        onClick={() => toggleExamAnswer(idx)}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors focus:outline-none"
                    >
                        {visibleExamAnswers[idx] ? 'Hide Answer Key' : 'Show Answer Key'}
                    </button>
                    
                    {visibleExamAnswers[idx] && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-slate-600 text-sm leading-relaxed border border-slate-100 animate-fade-in">
                            <strong>Key Points:</strong> {q.answerKey}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'quiz' && !quizStarted && (
           <div className="max-w-xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Test Your Knowledge?</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    This quiz contains {activeLesson.quiz.length} questions based on the lesson content. 
                    Review your notes and click below to begin.
                </p>
                <button 
                    onClick={() => setQuizStarted(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                    <PlayIcon className="w-5 h-5 fill-current" /> Start Assessment
                </button>
           </div>
        )}

        {activeTab === 'quiz' && quizStarted && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {activeLesson.quiz.map((q, idx) => {
              const isCorrect = quizSubmitted && quizAnswers[q.id] === q.correctAnswer;
              const isWrong = quizSubmitted && quizAnswers[q.id] !== q.correctAnswer;
              
              return (
                <div key={q.id} className={`bg-white p-8 rounded-3xl shadow-sm border-2 transition-all duration-300 ${
                  quizSubmitted 
                    ? (isCorrect ? 'border-green-200 bg-green-50/30' : (isWrong && quizAnswers[q.id] !== undefined ? 'border-red-200 bg-red-50/30' : 'border-slate-100'))
                    : 'border-transparent shadow-lg shadow-slate-200/50'
                }`}>
                  <div className="flex gap-6">
                    <span className="text-slate-200 font-black text-3xl select-none hidden sm:block">0{idx + 1}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-6">{q.question}</h3>
                      <div className="space-y-3">
                        {q.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => !quizSubmitted && setQuizAnswers(prev => ({...prev, [q.id]: optIdx}))}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 relative ${
                              quizAnswers[q.id] === optIdx 
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                            } ${
                              quizSubmitted && optIdx === q.correctAnswer ? '!border-green-500 !bg-green-100 !text-green-800' : ''
                            } ${
                              quizSubmitted && quizAnswers[q.id] === optIdx && optIdx !== q.correctAnswer ? '!border-red-500 !bg-red-100 !text-red-800' : ''
                            }`}
                          >
                            {option}
                            {quizSubmitted && optIdx === q.correctAnswer && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </span>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      {quizSubmitted && (
                          <div className="mt-6 p-4 bg-white/60 rounded-xl border border-slate-200 text-slate-700 text-sm shadow-sm animate-fade-in">
                              <span className="font-bold text-indigo-600 block mb-1">Explanation:</span>
                              {q.explanation}
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            <div className="flex items-center justify-between pt-8">
               {quizSubmitted && (
                 <div className="text-2xl font-bold animate-fade-in">
                   Score: <span className={score > 3 ? 'text-green-600' : 'text-orange-600'}>{score}</span> <span className="text-slate-400 text-lg">/ {activeLesson.quiz.length}</span>
                 </div>
               )}
               <button
                onClick={handleQuizSubmit}
                disabled={quizSubmitted}
                className="ml-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95"
               >
                 {quizSubmitted ? 'Quiz Completed' : 'Submit Answers'}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Chat Assistant */}
      <AssistantChat context={activeLesson.cleanedTranscript || ""} />
    </div>
  );
};

export default StudentView;