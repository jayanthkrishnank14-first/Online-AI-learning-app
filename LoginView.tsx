import React, { useState } from 'react';
import { AppMode } from '../types';
import { FingerprintIcon, SmartphoneIcon, ShieldCheckIcon, UserIcon, GraduationCapIcon } from './Icons';

interface LoginViewProps {
  onLogin: (role: AppMode) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState<AppMode>(AppMode.TEACHER);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Creds/Bio, 2 = OTP
  const [isLoading, setIsLoading] = useState(false);
  
  // Teacher State
  const [isBioScanned, setIsBioScanned] = useState(false);

  // Student State
  const [usn, setUsn] = useState('');
  const [phone, setPhone] = useState('');
  
  // OTP State
  const [otp, setOtp] = useState('');

  const resetState = () => {
    setStep(1);
    setIsBioScanned(false);
    setOtp('');
    setUsn('');
    setPhone('');
    setIsLoading(false);
  };

  const handleRoleChange = (role: AppMode) => {
    setActiveRole(role);
    resetState();
  };

  const handleTeacherBiometric = () => {
    setIsLoading(true);
    // Simulate Biometric Scan
    setTimeout(() => {
        setIsLoading(false);
        setIsBioScanned(true);
        // Automatically move to OTP step
        setStep(2);
        alert("Biometric Verified Successfully! Sending OTP...");
    }, 2000);
  };

  const handleStudentSubmit = () => {
    if (!usn.trim() || !phone.trim()) {
        alert("Please enter both USN and Phone Number.");
        return;
    }
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
        setIsLoading(false);
        setStep(2);
        alert(`OTP sent to ${phone}`);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) return;
    setIsLoading(true);
    // Simulate OTP Verification
    setTimeout(() => {
        setIsLoading(false);
        if (otp === '1234') { // Demo OTP
            onLogin(activeRole);
        } else {
            alert("Invalid OTP. Please enter '1234'.");
        }
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 -mr-10 -mt-10"></div>
             <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCapIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-wide">JK's EduAI Assistant</h1>
                <p className="text-indigo-100 text-sm mt-1">Secure Login Portal</p>
             </div>
        </div>

        {/* Role Switcher */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => handleRoleChange(AppMode.TEACHER)}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeRole === AppMode.TEACHER ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                TEACHER LOGIN
            </button>
            <button 
                onClick={() => handleRoleChange(AppMode.STUDENT)}
                className={`flex-1 py-4 text-sm font-bold tracking-wide transition-colors ${activeRole === AppMode.STUDENT ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                STUDENT LOGIN
            </button>
        </div>

        <div className="p-8">
            {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                    {activeRole === AppMode.TEACHER ? (
                        <div className="text-center space-y-6">
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all" onClick={!isLoading ? handleTeacherBiometric : undefined}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all ${isLoading ? 'bg-slate-100 animate-pulse' : 'bg-indigo-100 text-indigo-600 group-hover:scale-110'}`}>
                                    <FingerprintIcon className="w-10 h-10" />
                                </div>
                                <p className="font-bold text-slate-700">
                                    {isLoading ? "Scanning Biometrics..." : "Tap to Scan Fingerprint"}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">Secure Biometric Verification</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">USN Number</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={usn}
                                        onChange={(e) => setUsn(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, handleStudentSubmit)}
                                        placeholder="Enter your USN (e.g. 1JK23CS001)"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                <div className="relative">
                                    <SmartphoneIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, handleStudentSubmit)}
                                        placeholder="Enter mobile number"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleStudentSubmit}
                                disabled={isLoading || !usn || !phone}
                                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                                ) : (
                                    <>Send OTP <ShieldCheckIcon className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-fade-in text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <SmartphoneIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Enter Verification Code</h3>
                        <p className="text-slate-500 text-sm mt-1">
                            We sent a code to {activeRole === AppMode.TEACHER ? 'your registered device' : phone}
                        </p>
                        <p className="text-xs text-indigo-500 font-mono mt-2 bg-indigo-50 inline-block px-2 py-1 rounded">Demo OTP: 1234</p>
                    </div>

                    <input 
                        type="text" 
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, handleVerifyOtp)}
                        placeholder="0 0 0 0"
                        className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-b-2 border-slate-200 focus:border-indigo-600 focus:outline-none bg-transparent transition-colors"
                    />

                    <button 
                        onClick={handleVerifyOtp}
                        disabled={isLoading || otp.length !== 4}
                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                         {isLoading ? (
                             <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Verify & Login"}
                    </button>
                    
                    <button 
                        onClick={resetState}
                        className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                        Cancel & Try Again
                    </button>
                </div>
            )}
        </div>
      </div>
      <p className="mt-8 text-slate-400 text-xs font-medium text-center">
        &copy; {new Date().getFullYear()} JK's EduAI Assistant. All rights reserved.
      </p>
    </div>
  );
};

export default LoginView;