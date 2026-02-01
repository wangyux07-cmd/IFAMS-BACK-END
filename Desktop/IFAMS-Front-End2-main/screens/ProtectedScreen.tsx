import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/UI';
import { supabase } from '../src/supabaseClient';
import { AppContext } from '../context/AppContext';

const ProtectedScreen = () => {
    const navigate = useNavigate();
    const { setUsername } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUsername(user.user_metadata.name || user.email);
                navigate('/dashboard');
            } else {
                navigate('/'); // Redirect to login if no user
            }
            setLoading(false);
        };

        checkUser();

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUsername(session.user.user_metadata.name || session.user.email);
                navigate('/dashboard');
            } else if (event === 'SIGNED_OUT') {
                navigate('/');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate, setUsername]);

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center min-h-screen text-white text-lg">
                    Loading...
                </div>
            </AppShell>
        );
    }

    return null; // Will redirect, so nothing to render if not loading
};

export default ProtectedScreen;
