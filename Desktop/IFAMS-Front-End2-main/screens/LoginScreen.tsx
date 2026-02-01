import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, AppShell } from '../components/UI';
import { AppContext } from '../context/AppContext';
import { supabase } from '../src/supabaseClient';

const LoginScreen = () => {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const { setUsername } = context!;

    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    // Form States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("julian.reynolds@steady.com");
    const [password, setPassword] = useState("");

    const handleAuth = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            if (isRegistering) {
                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password, 
                    options: { data: { name } }, 
                    redirectTo: 'http://localhost:5173/' 
                });
                if (error) throw error;
                if (data.user) {
                    setUsername(data.user.user_metadata.name || data.user.email);
                    navigate('/dashboard');
                } else {
                    setErrorMessage('Registration successful, please check your email to confirm.');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (data.user) {
                    setUsername(data.user.user_metadata.name || data.user.email);
                    navigate('/dashboard');
                }
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell hideNav>
            {/* 1. Ambient Background - Deep & Rich */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050505]">
                 <div className="absolute top-[-20%] left-[-20%] w-[120%] h-[80%] rounded-full bg-gradient-radial from-brand-emerald/10 via-[#064E3B]/20 to-transparent opacity-40 blur-[100px] animate-pulse-slow"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[60%] rounded-full bg-gradient-radial from-blue-900/10 via-purple-900/5 to-transparent opacity-30 blur-[120px]"></div>
                 {/* Noise Overlay */}
                 <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
            </div>

            {/* Changed: Added pt-32 to shift content down, removed pb-12 to balance the shift */}
            <div className="relative z-10 flex flex-col h-full px-8 justify-center pt-32">
                
                {/* Logo Section */}
                <div className={`flex flex-col items-center mb-10 transition-all duration-500 ${isRegistering ? 'mt-4' : 'mt-0'}`}>
                    <div className="relative mb-8 group cursor-default">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-brand-emerald blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                        
                        <div className="relative size-24 rounded-[28px] bg-gradient-to-br from-white/10 to-white/5 p-[1px] shadow-2xl backdrop-blur-md border border-white/10">
                             <div className="size-full rounded-[27px] bg-[#050B08]/80 flex items-center justify-center border border-white/5 group-hover:bg-[#050B08]/60 transition-colors">
                                 <Icon name="account_balance_wallet" className="text-4xl text-brand-emerald drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                             </div>
                             {/* Corner Shine */}
                             <div className="absolute top-0 right-0 p-4 bg-white/10 rounded-full blur-xl opacity-20"></div>
                        </div>
                    </div>
                    
                    {/* Changed Name to SmartAM */}
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 text-center drop-shadow-md">SmartAM</h1>
                    <div className="flex items-center gap-2 opacity-60">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-brand-emerald"></div>
                        <p className="text-[10px] font-bold text-brand-emerald uppercase tracking-[0.3em]">{isRegistering ? 'Membership Application' : 'Executive Wealth Hub'}</p>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-brand-emerald"></div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full space-y-4 animate-fade-in-up delay-100">
                    
                    {/* Registration Name Field - Animated expand */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isRegistering ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="group relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-300 group-focus-within:text-brand-emerald">
                                <Icon name="badge" className="text-xl" />
                            </div>
                            <input 
                                className="w-full h-16 bg-[#0A0F0D]/60 backdrop-blur-md border border-white/10 rounded-2xl pl-14 pr-5 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-emerald/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all text-sm font-medium" 
                                placeholder="Full Name" 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="group relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-300 group-focus-within:text-brand-emerald">
                            <Icon name="mail" className="text-xl" />
                        </div>
                        <input 
                            className="w-full h-16 bg-[#0A0F0D]/60 backdrop-blur-md border border-white/10 rounded-2xl pl-14 pr-5 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-emerald/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all text-sm font-medium" 
                            placeholder={isRegistering ? "Email Address" : "Executive ID"}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="group relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-300 group-focus-within:text-brand-emerald">
                            <Icon name="lock" className="text-xl" />
                        </div>
                        <input 
                            className="w-full h-16 bg-[#0A0F0D]/60 backdrop-blur-md border border-white/10 rounded-2xl pl-14 pr-5 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-emerald/50 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all text-sm font-medium" 
                            placeholder={isRegistering ? "Create Passcode" : "Passcode"}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {errorMessage && (
                        <p className="text-red-500 text-sm text-center mt-4">{errorMessage}</p>
                    )}

                    {/* Flat, Clean Modern Button */}
                    <button 
                        onClick={handleAuth} 
                        disabled={loading}
                        className="w-full h-16 rounded-2xl bg-brand-emerald text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-emerald/10 hover:bg-emerald-500 active:scale-[0.98] transition-all duration-300 mt-6 flex items-center justify-center gap-2 group border border-white/10"
                    >
                        {loading ? (
                             <div className="flex gap-1.5">
                                <div className="size-1.5 bg-white rounded-full animate-bounce"></div>
                                <div className="size-1.5 bg-white rounded-full animate-bounce delay-100"></div>
                                <div className="size-1.5 bg-white rounded-full animate-bounce delay-200"></div>
                            </div>
                         ) : (
                            <>
                                <span>{isRegistering ? 'Request Access' : 'Authenticate'}</span>
                                <Icon name={isRegistering ? "person_add" : "fingerprint"} className="text-white/80 text-lg group-hover:text-white transition-colors" />
                            </>
                         )}
                    </button>
                    
                    {/* Toggle Mode Area */}
                    <div className="flex justify-center items-center mt-6 gap-2">
                         <span className="text-[10px] text-gray-500 font-medium">
                            {isRegistering ? "Already a member?" : "New to SmartAM?"}
                         </span>
                         <button 
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-[10px] font-bold text-brand-emerald hover:text-white transition-colors uppercase tracking-wider relative group"
                        >
                            {isRegistering ? "Sign In" : "Apply for Membership"}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-emerald group-hover:w-full transition-all duration-300"></span>
                         </button>
                    </div>
                </div>

                {/* Biometric Section (Only visible in Login Mode) */}
                <div className={`mt-12 flex flex-col items-center transition-all duration-500 ${isRegistering ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
                    <button onClick={handleAuth} className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-3xl transition-all hover:bg-white/[0.02]">
                        <div className="relative size-16 rounded-2xl border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:border-brand-emerald/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-500 overflow-hidden">
                            <Icon name="face" className="text-3xl text-gray-400 group-hover:text-brand-emerald transition-colors relative z-10" />
                             {/* Scan line animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-emerald/80 shadow-[0_0_10px_#10B981] opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity"></div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-brand-emerald transition-colors">Face ID</span>
                    </button>
                </div>
            </div>
            
             {/* Version Footer */}
            <div className="absolute bottom-6 w-full text-center pointer-events-none opacity-30">
                <p className="text-[9px] font-mono text-gray-500">SECURE_ENCLAVE_V1.0</p>
            </div>
        </AppShell>
    );
};

export default LoginScreen;