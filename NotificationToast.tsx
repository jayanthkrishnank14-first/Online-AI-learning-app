import React from 'react';
import { AppNotification } from '../types';
import { BellIcon, BrainCircuitIcon, XIcon, CheckCircleIcon } from './Icons';

interface NotificationToastProps {
  notifications: AppNotification[];
  onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notifications, onClose }) => {
  // Only show the top 3 unread notifications to avoid clutter
  const displayNotifications = notifications.slice(0, 3);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 w-80 sm:w-96 pointer-events-none">
      {displayNotifications.map((note) => (
        <div 
          key={note.id} 
          className="bg-white p-4 rounded-xl shadow-2xl border-l-4 border-l-indigo-500 border border-slate-200 animate-fade-in-up pointer-events-auto flex gap-3 relative overflow-hidden"
        >
          {/* Icon Based on Type */}
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            note.type === 'ai' ? 'bg-purple-100 text-purple-600' :
            note.type === 'alert' ? 'bg-red-100 text-red-600' :
            note.type === 'success' ? 'bg-green-100 text-green-600' :
            'bg-blue-100 text-blue-600'
          }`}>
             {note.type === 'ai' ? <BrainCircuitIcon className="w-5 h-5" /> : 
              note.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> :
              <BellIcon className="w-5 h-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              {note.title}
              {note.type === 'ai' && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">AI</span>}
            </h4>
            <p className="text-sm text-slate-600 leading-tight mt-1">{note.message}</p>
            <span className="text-[10px] text-slate-400 mt-2 block">Just now</span>
          </div>

          <button 
            onClick={() => onClose(note.id)}
            className="absolute top-2 right-2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;