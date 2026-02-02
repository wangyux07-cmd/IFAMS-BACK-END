import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/UI';
import { supabase } from '../src/supabaseClient';
import { AppContext } from '../context/AppContext'; // Import AppContext for context loading state

const ProtectedScreen = () => {
    const navigate = useNavigate();
    const { loading: contextLoading } = useContext(AppContext)!; // Use context loading state
    const [authCheckComplete, setAuthCheckComplete] = useState(false);

    useEffect(() => {
        const checkUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // User is logged in, navigate to dashboard
                navigate('/dashboard');
            } else {
                // No user session, navigate to login
                navigate('/');
            }
            setAuthCheckComplete(true);
        };

        checkUserSession();

        // Listen for auth state changes to handle redirects
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                navigate('/dashboard');
            } else if (event === 'SIGNED_OUT') {
                navigate('/');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [navigate]); // No dependency on setUsername as AppContext handles it

    // Display loading only if both context is loading OR auth check isn't complete
    if (contextLoading || !authCheckComplete) {
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

