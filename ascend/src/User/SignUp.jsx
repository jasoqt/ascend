import React, { useState } from 'react';
import { User, Lock, Mail, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getSupabaseErrorMessage } from '../supabase';
import './styles/SignUp.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        suffix: '',
        email: '',
        password: '',
        confirmPassword: '',
        sex: '',
        birthday: '',
        agreeToTerms: false
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
        setSuccessMessage('');
        setIsLoading(true);

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        if (!formData.agreeToTerms) {
            setError('You must agree to the Terms of Service and Privacy Policy');
            setIsLoading(false);
            return;
        }

        // Validate age (must be at least 13 years old)
        const birthday = new Date(formData.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        
        if (age < 13 || (age === 13 && monthDiff < 0) || (age === 13 && monthDiff === 0 && today.getDate() < birthday.getDate())) {
            setError('You must be at least 13 years old to create an account');
            setIsLoading(false);
            return;
        }

        try {
            // Step 1: Create the user account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName
                    }
                }
            });

            if (authError) {
                console.error('Auth error:', authError);
                setError(getSupabaseErrorMessage(authError));
                setIsLoading(false);
                return;
            }

            if (authData.user) {
                // Step 2: Create the user profile
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            first_name: formData.firstName,
                            middle_name: formData.middleName || null,
                            last_name: formData.lastName,
                            suffix: formData.suffix || null,
                            sex: formData.sex,
                            birthday: formData.birthday
                        }
                    ]);

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    // If profile creation fails, we should clean up the auth user
                    // but for now, we'll just show an error
                    setError('Account created but profile setup failed. Please contact support.');
                    setIsLoading(false);
                    return;
                }

                // Success!
                setSuccessMessage('Account created successfully! Please check your email to verify your account.');
                
                // Clear the form
                setFormData({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    suffix: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    sex: '',
                    birthday: '',
                    agreeToTerms: false
                });

                // Optionally redirect after a delay
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
            
        } catch (err) {
            console.error('Unexpected signup error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-hero">
                <div className="hero-content">
                    <h2>Join Ascend Today</h2>
                    <p>Start your journey to better health and wellness</p>
                    <div className="benefits">
                        <div className="benefit-item">
                            <CheckCircle size={20} />
                            <span>Personalized nutrition plans</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} />
                            <span>Expert guidance and support</span>
                        </div>
                        <div className="benefit-item">
                            <CheckCircle size={20} />
                            <span>Progress tracking tools</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="signup-form-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <div className="signup-logo" onClick={() => navigate('/')}>
                            <span className="logo-icon"></span>
                            <span className="logo-text">Ascend</span>
                        </div>
                        <h1>Create Your Account</h1>
                        <p>Fill in your details to get started</p>
                    </div>

                    {error && <div className="signup-error">{error}</div>}
                    {successMessage && <div className="signup-success">{successMessage}</div>}

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="form-group name-group">
                            <div className="input-icon">
                                <User size={20} />
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-icon">
                                <User size={20} />
                                <input
                                    type="text"
                                    name="middleName"
                                    placeholder="Middle Name"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-icon">
                                <User size={20} />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-icon">
                                <User size={20} />
                                <input
                                    type="text"
                                    name="suffix"
                                    placeholder="Suffix (Optional)"
                                    value={formData.suffix}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <User size={20} />
                                <input
                                    type="text"
                                    name="sex"
                                    value={formData.sex}
                                    readOnly
                                    placeholder="Sex"
                                    className="sex-input"
                                />
                                <select
                                    name="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                    required
                                    className="sex-select-overlay"
                                >
                                    <option value="">Sex</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <Calendar size={20} />
                                <input
                                    type="date"
                                    name="birthday"
                                    value={formData.birthday}
                                    onChange={handleChange}
                                    required
                                    placeholder="Birthday"
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <Mail size={20} />
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
                                    placeholder="Password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <Lock size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="terms-checkbox">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    required
                                />
                                <span>I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className={`signup-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p>Already have an account? <a href="/login">Sign in</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;