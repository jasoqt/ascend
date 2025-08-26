import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getSupabaseErrorMessage } from '../supabase';
import './styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Attempt to sign in with Supabase
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (signInError) {
                console.error('Login error:', signInError);
                setError(getSupabaseErrorMessage(signInError));
                setIsLoading(false);
                return;
            }

            if (data.user) {
                // Check if email is confirmed
                if (!data.user.email_confirmed_at) {
                    setError('Please check your email and click the verification link before signing in.');
                    setIsLoading(false);
                    return;
                }

                // Successfully logged in
                console.log('Login successful:', data.user);
                
                // Navigate to home page
                navigate('/home');
            }

        } catch (err) {
            console.error('Unexpected login error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo" onClick={() => navigate('/')}>
                        <span className="logo-icon"></span>
                        <span className="logo-text">Ascend</span>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Continue your health journey</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-icon">
                            <User size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-icon">
                            <Lock size={20} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-options">
                        <label className="remember-me">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <span>Remember me</span>
                        </label>
                        <a href="/forgot-password" className="forgot-password">
                            Forgot password?
                        </a>
                    </div>

                    <button 
                        type="submit" 
                        className={`login-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <a href="/signup">Sign up</a></p>
                </div>
            </div>
        </div>
    );
};

export default Login;