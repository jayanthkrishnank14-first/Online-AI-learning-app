import React, { useState } from 'react';
import { AppMode, LessonData, AppNotification, Appointment } from './types';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import LoginView from './components/LoginView';
import NotificationToast from './components/NotificationToast';
import { GraduationCapIcon, LogOutIcon, BellIcon } from './components/Icons';

// Demo Data Initialization
const DEMO_LESSONS: LessonData[] = [
  {
    id: 'demo-1',
    topic: "Newton's Third Law",
    rawTranscript: "So, um, good morning everyone. Settle down please. Today, uh, we're gonna talk about, you know, Newton's Third Law...",
    cleanedTranscript: "Newton's Third Law states that for every action, there is an equal and opposite reaction. This means that in every interaction, there is a pair of forces acting on the two interacting objects. The size of the forces on the first object equals the size of the force on the second object. The direction of the force on the first object is opposite to the direction of the force on the second object. Forces always come in pairs - equal and opposite action-reaction force pairs.",
    summary: "Newton's Third Law explains that forces always occur in pairs. If object A exerts a force on object B, object B exerts an equal and opposite force on object A. This interaction is simultaneous.",
    realLifeExamples: [
      "Walking: You push the ground backward, and the ground pushes you forward with equal force.",
      "Rocket Launch: The rocket engines push gas downward, and the gas pushes the rocket upward.",
      "Rowing a boat: You push the water back with the paddle, and the water pushes the boat forward."
    ],
    examQuestions: [
      { 
        question: "State Newton's Third Law and provide one example.", 
        marks: 3, 
        type: "Short",
        answerKey: "Definition: Every action has an equal and opposite reaction. Example: Recoil of a gun or swimming."
      },
      { 
        question: "Explain why a rocket can accelerate in space where there is no air to push against.", 
        marks: 4, 
        type: "Medium",
        answerKey: "Rockets work by expelling gas backward at high speed. By Newton's 3rd Law, the gas exerts an equal and opposite force forward on the rocket. It does not need air to push against."
      },
      { 
        question: "Discuss the forces involved when a person jumps off a small boat versus a concrete dock.", 
        marks: 5, 
        type: "Long",
        answerKey: "When jumping, you push back on the surface. A concrete dock has large mass/friction and doesn't move, so you accelerate forward. A small boat moves backward (recoils) as you push, absorbing some energy, making the jump less effective."
      }
    ],
    quiz: [
        { id: 1, question: "Action and reaction forces act on:", options: ["The same object", "Different objects", "No objects", "Gravity only"], correctAnswer: 1, explanation: "Action and reaction forces always act on two different interacting objects (e.g., foot pushes ground, ground pushes foot)." },
        { id: 2, question: "If you punch a wall with 50N of force, the wall hits you back with:", options: ["0N", "25N", "50N", "100N"], correctAnswer: 2, explanation: "Forces are always equal in magnitude. If you exert 50N, the wall exerts 50N back." },
        { id: 3, question: "Forces always occur in:", options: ["Triplets", "Pairs", "Isolation", "Sequence"], correctAnswer: 1, explanation: "Forces never exist in isolation; they always exist as an action-reaction pair." },
        { id: 4, question: "The direction of the reaction force is:", options: ["Same as action", "Perpendicular to action", "Opposite to action", "Random"], correctAnswer: 2, explanation: "The reaction force is always 180 degrees (opposite) to the direction of the action force." },
        { id: 5, question: "Which example best demonstrates the law?", options: ["A book resting on a table", "A car braking", "A swimmer pushing off a pool wall", "A falling apple"], correctAnswer: 2, explanation: "A swimmer pushing the wall backward to move forward is a direct application of action-reaction." }
    ],
    isProcessing: false
  },
  {
    id: 'demo-2',
    topic: "Photosynthesis Basics",
    rawTranscript: "Okay class, let's look at how plants eat. It's called photosynthesis...",
    cleanedTranscript: "Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy. Plants take in carbon dioxide (CO2) from the air and water (H2O) from the soil. Inside the plant cells, specifically in the chloroplasts, chlorophyll traps light energy. The plant converts this light energy, CO2, and water into glucose (sugar) and oxygen. The glucose is used by the plant for energy and growth, while oxygen is released as a byproduct.",
    summary: "Photosynthesis is the biological process where plants use sunlight to convert water and carbon dioxide into glucose and oxygen, providing food for the plant and oxygen for the atmosphere.",
    realLifeExamples: [
      "Solar Panels: Similar to leaves, solar panels capture sunlight to generate usable energy (electricity).",
      "Baking a Cake: You take ingredients (CO2 + Water) and apply heat (Sunlight) to create a finished product (Glucose).",
      "Recharging a Battery: Photosynthesis stores energy in chemical bonds (glucose) just like charging stores energy in a battery."
    ],
    examQuestions: [
      { 
        question: "What is the primary purpose of photosynthesis?", 
        marks: 3, 
        type: "Short",
        answerKey: "To convert light energy into chemical energy (glucose) for the plant's growth."
      },
      { 
        question: "Write the word equation for photosynthesis.", 
        marks: 4, 
        type: "Medium",
        answerKey: "Carbon Dioxide + Water --(Light/Chlorophyll)--> Glucose + Oxygen."
      },
      { 
        question: "Explain the role of chlorophyll and chloroplasts in the process.", 
        marks: 5, 
        type: "Long",
        answerKey: "Chloroplasts are the organelles where photosynthesis happens. Chlorophyll is the pigment inside them that absorbs light energy required to drive the chemical reaction."
      }
    ],
    quiz: [
        { id: 1, question: "What gas do plants take in from the air?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"], correctAnswer: 1, explanation: "Plants take in Carbon Dioxide (CO2) through their leaves (stomata) to use as a carbon source." },
        { id: 2, question: "Where does photosynthesis mainly take place?", options: ["Roots", "Stems", "Leaves (Chloroplasts)", "Flowers"], correctAnswer: 2, explanation: "It happens primarily in the leaves because they contain the most chloroplasts to capture sunlight." },
        { id: 3, question: "What is the main energy source for photosynthesis?", options: ["Wind", "Soil", "Sunlight", "Water"], correctAnswer: 2, explanation: "Sunlight provides the energy required to break down water and CO2 molecules to form glucose." },
        { id: 4, question: "What is the 'food' produced by plants?", options: ["Protein", "Glucose (Sugar)", "Fat", "Salt"], correctAnswer: 1, explanation: "The product of photosynthesis is glucose, a simple sugar that plants use for energy." },
        { id: 5, question: "What byproduct is released for us to breathe?", options: ["Carbon Dioxide", "Oxygen", "Methane", "Argon"], correctAnswer: 1, explanation: "Oxygen is released as a waste product of photosynthesis, which is essential for animal life." }
    ],
    isProcessing: false
  }
];

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<AppMode | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>(DEMO_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const handleLogin = (role: AppMode) => {
    setCurrentUserRole(role);
    // Clear notifications on role switch to simulate fresh login
    setNotifications([]);
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setActiveLessonId(null);
  };

  const handleAddLesson = (newLesson: LessonData) => {
    setLessons(prev => [newLesson, ...prev]);
    // When teacher adds a lesson, notify students
    triggerNotification(
      AppMode.STUDENT,
      "New Lesson Added",
      `Teacher has published a new lesson: ${newLesson.topic}`,
      'info'
    );
  };

  const handleBookAppointment = (apt: Appointment) => {
    setAppointments(prev => [...prev, apt]);
    triggerNotification(
      AppMode.TEACHER,
      "New Doubt Session Request",
      `${apt.studentName} requested a session on ${apt.topic}`,
      'alert'
    );
  };

  const triggerNotification = (targetRole: AppMode, title: string, message: string, type: 'info' | 'alert' | 'success' | 'ai') => {
    const newNote: AppNotification = {
      id: Date.now().toString() + Math.random(),
      targetRole,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
        dismissNotification(newNote.id);
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter notifications for current user
  const userNotifications = notifications.filter(n => n.targetRole === currentUserRole);

  if (!currentUserRole) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Toast Container */}
      <NotificationToast notifications={userNotifications} onClose={dismissNotification} />

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <GraduationCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                JK's EduAI Assistant
              </span>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Bell Icon with Badge */}
               <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <BellIcon className="w-6 h-6 text-slate-500" />
                  {userNotifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
               </div>

               <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <div className={`w-2 h-2 rounded-full ${currentUserRole === AppMode.TEACHER ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {currentUserRole === AppMode.TEACHER ? 'Teacher Portal' : 'Student Portal'}
                  </span>
               </div>

               <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
               >
                 <LogOutIcon className="w-4 h-4" />
                 Logout
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {currentUserRole === AppMode.TEACHER ? (
          <TeacherView 
            onLessonCreated={handleAddLesson}
            onNotification={(title, msg, type) => triggerNotification(AppMode.TEACHER, title, msg, type)}
            appointments={appointments}
          />
        ) : (
          <StudentView 
            lessons={lessons}
            activeLessonId={activeLessonId}
            onSelectLesson={setActiveLessonId}
            onNotification={(title, msg, type) => triggerNotification(AppMode.STUDENT, title, msg, type)}
            onTeacherAlert={(title, msg) => triggerNotification(AppMode.TEACHER, title, msg, 'success')}
            onBookAppointment={handleBookAppointment}
          />
        )}
      </main>
    </div>
  );
};

export default App;