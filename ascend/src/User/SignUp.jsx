import React, { useState } from 'react';
import { User, Lock, Mail, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles/SignUp.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Here you would typically make an API call to create the account
            navigate('/dashboard');
        } catch (err) {
            setError('An error occurred. Please try again.');
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

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-icon">
                                <User size={20} />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
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
                                    placeholder="Password"
                                    value={formData.password}
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