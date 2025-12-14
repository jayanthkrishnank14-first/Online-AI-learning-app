import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, PlayIcon, BrainCircuitIcon, UploadCloudIcon, FileVideoIcon, BarChartIcon, UserIcon, CalendarIcon, ClockIcon } from './Icons';
import { LessonData, StudentProfile, Appointment } from '../types';
import { cleanTranscript, generateExamQuestions, generateQuiz, generateSummaryAndExamples, transcribeMedia, generateNotification } from '../services/geminiService';
import ProgressMentor from './ProgressMentor';

interface TeacherViewProps {
  onLessonCreated: (data: LessonData) => void;
  onNotification: (title: string, message: string, type: 'info' | 'alert' | 'success' | 'ai') => void;
  appointments: Appointment[];
}

const DUMMY_TRANSCRIPT = `So, um, good morning everyone. Settle down please. Today, uh, we're gonna talk about, you know, Newton's Third Law. It's actually pretty cool. Like, imagine you're on a skateboard, right? And you push against a wall. What happens? You go backwards! That's not magic, guys, that's physics.

So the law states, formally, that for every action, there is an equal and opposite reaction. I remember when I was in college, my professor tripped over a wire demonstrating this... anyway, forget that. The key here is "equal" and "opposite".

If object A exerts a force on object B, object B exerts a force of equal magnitude and opposite direction back on object A. Forces always come in pairs. Always. You can't touch something without it touching you back. Spooky, right? No, just nature.

Think about a rocket. It pushes gas down, the gas pushes the rocket up. Simple.
Um, is this thing on? Okay. So, for the exam, remember the formula F_ab = -F_ba. Don't forget the negative sign! That shows direction.
Okay, let's wrap up this part and move to the lab.`;

// Mock Student Data for Teacher View
const MOCK_STUDENTS: StudentProfile[] = [
    { id: '1', name: 'Alice Johnson', usn: '1JK23CS001', averageScore: 88, lessonsCompleted: 12, attendance: 95, quizHistory: [] },
    { id: '2', name: 'Bob Smith', usn: '1JK23CS002', averageScore: 72, lessonsCompleted: 10, attendance: 80, quizHistory: [] },
    { id: '3', name: 'Charlie Brown', usn: '1JK23CS003', averageScore: 45, lessonsCompleted: 5, attendance: 60, quizHistory: [] },
    { id: '4', name: 'Diana Prince', usn: '1JK23CS004', averageScore: 95, lessonsCompleted: 15, attendance: 100, quizHistory: [] },
];

const TeacherView: React.FC<TeacherViewProps> = ({ onLessonCreated, onNotification, appointments }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'analytics' | 'schedule'>('create');
  
  // Lesson Creation State
  const [topic, setTopic] = useState('');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate AI Alert on Mount
  useEffect(() => {
    const timer = setTimeout(async () => {
        // Use Gemini to generate a dynamic notification based on mock data
        const alertMsg = await generateNotification("Student Charlie Brown has low attendance in Physics", 'TEACHER');
        onNotification("AI Alert", alertMsg, 'alert');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleProcess = async () => {
    if (!transcriptInput.trim() || !topic.trim()) return;

    setIsProcessing(true);
    const tempId = Date.now().toString();
    
    try {
      // 1. Clean Transcript
      const cleaned = await cleanTranscript(transcriptInput);
      
      // 2. Parallel Generation for Efficiency
      const [summaryData, examQuestions, quizQuestions] = await Promise.all([
        generateSummaryAndExamples(cleaned),
        generateExamQuestions(cleaned),
        generateQuiz(cleaned)
      ]);

      const newLesson: LessonData = {
        id: tempId,
        topic,
        rawTranscript: transcriptInput,
        cleanedTranscript: cleaned,
        summary: summaryData.summary,
        realLifeExamples: summaryData.examples,
        examQuestions: examQuestions,
        quiz: quizQuestions,
        isProcessing: false,
      };

      onLessonCreated(newLesson);
      
      // Reset form
      setTopic('');
      setTranscriptInput('');
      setSelectedFile(null);
      setIsProcessing(false);
      onNotification("Success", "Lesson created and pushed to students!", "success");

    } catch (error) {
      console.error("Pipeline failed", error);
      setIsProcessing(false);
      alert("AI Processing Failed. Please check your API Key.");
    }
  };

  const simulateRecording = () => {
    setTopic("Newton's Third Law");
    setTranscriptInput(DUMMY_TRANSCRIPT);
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Basic check for video/audio types
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        setSelectedFile(file);
    } else {
        alert("Please upload a valid video or audio file.");
    }
  };

  const startTranscription = () => {
    if (!selectedFile) return;
    setIsTranscribing(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
        try {
            const base64String = reader.result?.toString().split(',')[1];
            if (base64String) {
                const text = await transcribeMedia(base64String, selectedFile.type);
                setTranscriptInput(prev => (prev ? prev + "\n\n" + text : text));
                setSelectedFile(null); // Clear file after processing
                setIsTranscribing(false);
            }
        } catch (error) {
            console.error("Transcription error", error);
            setIsTranscribing(false);
            alert("Failed to transcribe. The file might be too large for browser-based processing.");
        }
    };
    reader.onerror = () => {
        setIsTranscribing(false);
        alert("Error reading file.");
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-200 pb-6">
          <div className="text-left">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Teacher Portal</h1>
            <p className="text-lg text-slate-500">Manage lessons and track student performance.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button 
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'create' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
              >
                  Create Lesson
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
              >
                  <BarChartIcon className="w-4 h-4" /> Analytics
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
              >
                  <CalendarIcon className="w-4 h-4" /> Schedule
              </button>
          </div>
      </div>

      {activeTab === 'create' && (
        <>
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Lesson Topic</label>
                <input
                    type="text"
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white font-medium text-lg placeholder:font-normal"
                    placeholder="e.g., Introduction to Thermodynamics"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
                </div>

                {/* Video Upload Section */}
                <div className="relative z-10">
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Video Source</label>
                    <div 
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {isTranscribing ? (
                            <div className="flex flex-col items-center py-4">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                <p className="font-bold text-indigo-600">Transcribing Video...</p>
                                <p className="text-sm text-slate-500 mt-2">This may take a moment depending on file size.</p>
                            </div>
                        ) : !selectedFile ? (
                            <div 
                                className="flex flex-col items-center cursor-pointer py-4"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloudIcon className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="font-bold text-slate-700">Drag & Drop Video Lecture Here</p>
                                <p className="text-sm text-slate-400 mt-1">or click to browse (MP4, MOV, WEBM)</p>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="video/*,audio/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-4">
                                <FileVideoIcon className="w-12 h-12 text-indigo-500 mb-4" />
                                <p className="font-bold text-slate-700 mb-1">{selectedFile.name}</p>
                                <p className="text-xs text-slate-400 mb-4">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={startTranscription}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        Start Transcription
                                    </button>
                                    <button 
                                        onClick={() => setSelectedFile(null)}
                                        className="bg-white text-slate-500 border border-slate-200 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative z-10">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Lecture Transcript & Teacher Notes</label>
                <div className="relative group">
                    <textarea
                    className="w-full h-80 px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none bg-white text-slate-700 leading-relaxed custom-scrollbar"
                    placeholder="Speak, paste lecture transcript, or add your notes here..."
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                    <button 
                        onClick={simulateRecording}
                        className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200"
                        title="Populate with dummy text"
                    >
                        <MicIcon className="w-4 h-4" /> Load Demo
                    </button>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    AI will combine your notes and the video transcript to generate materials.
                </p>
                </div>

                <button
                onClick={handleProcess}
                disabled={isProcessing || !topic || !transcriptInput}
                className={`relative z-10 w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] ${
                    isProcessing 
                    ? 'bg-slate-100 text-slate-400 cursor-wait' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300'
                }`}
                >
                {isProcessing ? (
                    <>
                    <BrainCircuitIcon className="w-6 h-6 animate-pulse" /> Processing Lecture...
                    </>
                ) : (
                    <>
                    <PlayIcon className="w-6 h-6 fill-current" /> Generate Course Material
                    </>
                )}
                </button>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BrainCircuitIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Smart Cleanup</h3>
                    <p className="text-sm text-slate-500">Intelligently removes fluff while preserving core facts.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PlayIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Auto-Quiz</h3>
                    <p className="text-sm text-slate-500">Instantly generates graded quizzes and exam questions.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MicIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Personal Tutor</h3>
                    <p className="text-sm text-slate-500">Built-in AI assistant helps students clarify doubts.</p>
                </div>
            </div>
        </>
      )}

      {activeTab === 'analytics' && (
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-indigo-600" /> Class Performance
                  </h2>
                  <div className="space-y-6">
                      {MOCK_STUDENTS.map(student => (
                          <div key={student.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                  <div>
                                      <h3 className="font-bold text-slate-900">{student.name}</h3>
                                      <p className="text-xs text-slate-500 font-mono">{student.usn}</p>
                                  </div>
                                  <div className="text-right">
                                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${student.averageScore >= 80 ? 'bg-green-100 text-green-700' : student.averageScore >= 50 ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                                          {student.averageScore}% Avg
                                      </span>
                                  </div>
                              </div>
                              {/* Mastery Bar */}
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                  <div 
                                    className={`h-full rounded-full ${student.averageScore >= 80 ? 'bg-green-500' : student.averageScore >= 50 ? 'bg-indigo-500' : 'bg-red-500'}`} 
                                    style={{width: `${student.averageScore}%`}}
                                  ></div>
                              </div>
                              <div className="flex justify-between text-xs text-slate-400">
                                  <span>Attendance: {student.attendance}%</span>
                                  <span>Lessons Completed: {student.lessonsCompleted}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* AI Insight for Teacher */}
              <ProgressMentor role="TEACHER" data={MOCK_STUDENTS} />
          </div>
      )}

      {activeTab === 'schedule' && (
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-indigo-600" /> Upcoming Doubt Sessions
                  </h2>
                  
                  {appointments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                          <p>No appointments scheduled yet.</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 gap-4">
                          {appointments.map(apt => (
                              <div key={apt.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-start">
                                  <div>
                                      <div className="flex items-center gap-2 mb-2">
                                          <span className="font-bold text-slate-900">{apt.studentName}</span>
                                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Doubt Session</span>
                                      </div>
                                      <p className="text-slate-600 text-sm mb-3 font-medium">Topic: {apt.topic}</p>
                                      <div className="flex gap-4 text-xs text-slate-500">
                                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {apt.date}</span>
                                          <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {apt.timeSlot}</span>
                                      </div>
                                  </div>
                                  <button className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">
                                      Confirm
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default TeacherView;