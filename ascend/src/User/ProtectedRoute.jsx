import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get current session
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                
                if (error) {
                    console.error('Auth error:', error);
                    setUser(null);
                } else {
                    setUser(user);
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column'
            }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '20px', color: '#666' }}>
                    Checking authentication...
                </p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;