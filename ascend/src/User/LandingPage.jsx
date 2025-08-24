import React, { useState } from 'react';
    import { CheckCircle, ChevronRight, Calendar, BarChart2, Users, Menu, X } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import './styles/LandingPage.css'; // Assuming you have a CSS file for styling

    const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    const testimonials = [
        {
        name: "Sarah M.",
        text: "Ascend completely transformed my approach to nutrition. I've lost 20 pounds and feel amazing!",
        role: "Member since 2024"
        },
        {
        name: "James T.",
        text: "The personalized workout plans fit perfectly into my busy schedule. Best fitness app I've used.",
        role: "Member since 2023"
        },
        {
        name: "Aisha K.",
        text: "Having expert nutritionists available for questions has been invaluable for my health journey.",
        role: "Member since 2024"
        }
    ];

    return (
        <div className="landing-container">
        {/* Navigation */}
        <nav className="navbar">
            <div className="nav-container">
            <div className="logo">
                <span className="logo-icon"></span>
                <span className="logo-text">Ascend</span>
            </div>
            
            <div className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
            
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><button onClick={() => navigate('/login')} className="nav-btn nav-btn-secondary">Log In</button></li>
                <li><button onClick={() => navigate('/signup')} className="nav-btn nav-btn-primary">Sign Up</button></li>
            </ul>
            </div>
        </nav>

        {/* Hero Section */}
        <header className="hero">
            <div className="hero-content">
            <h1>Transform Your Health Journey</h1>
            <p>Personalized nutrition plans, expert guidance, and progress tracking all in one place.</p>
            <div className="hero-cta">
                <a href="#get-started" className="cta-btn cta-btn-primary">Get Started Free</a>
                <a href="#learn-more" className="cta-btn cta-btn-secondary">
                Learn More
                <ChevronRight size={16} className="btn-icon" />
                </a>
            </div>
            <div className="hero-stats">
                <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Active Users</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                <span className="stat-number">95%</span>
                <span className="stat-label">Success Rate</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                <span className="stat-number">4.9</span>
                <span className="stat-label">App Rating</span>
                </div>
            </div>
            </div>
            <div className="hero-image">
            <img src="/api/placeholder/480/360" alt="Ascend App Preview" />
            </div>
        </header>

        {/* Features Section */}
        <section id="features" className="features-section">
            <div className="section-heading">
            <h2>Everything You Need to Succeed</h2>
            <p>Powerful tools designed to support your health and fitness journey</p>
            </div>
            <div className="features">
            <div className="feature-card">
                <div className="feature-icon">
                <Calendar size={32} />
                </div>
                <h3>Personalized Plans</h3>
                <p>Custom nutrition and workout plans tailored to your unique goals, preferences, and lifestyle.</p>
                <ul className="feature-list">
                <li><CheckCircle size={16} className="check-icon" /> Goal-based meal planning</li>
                <li><CheckCircle size={16} className="check-icon" /> Dietary restriction options</li>
                <li><CheckCircle size={16} className="check-icon" /> Adaptive workout schedules</li>
                </ul>
            </div>
            
            <div className="feature-card">
                <div className="feature-icon">
                <BarChart2 size={32} />
                </div>
                <h3>Progress Tracking</h3>
                <p>Monitor your meals, workouts, and health metrics all in one intuitive dashboard.</p>
                <ul className="feature-list">
                <li><CheckCircle size={16} className="check-icon" /> Visual progress charts</li>
                <li><CheckCircle size={16} className="check-icon" /> Health metric analysis</li>
                <li><CheckCircle size={16} className="check-icon" /> Goal achievement tracking</li>
                </ul>
            </div>
            
            <div className="feature-card">
                <div className="feature-icon">
                <Users size={32} />
                </div>
                <h3>Expert Guidance</h3>
                <p>Connect with certified nutritionists and trainers for personalized support and advice.</p>
                <ul className="feature-list">
                <li><CheckCircle size={16} className="check-icon" /> 1-on-1 virtual coaching</li>
                <li><CheckCircle size={16} className="check-icon" /> Weekly check-ins</li>
                <li><CheckCircle size={16} className="check-icon" /> Community support</li>
                </ul>
            </div>
            </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
            <div className="about-content">
            <div className="about-text">
                <h2>Why Choose Ascend?</h2>
                <p className="about-lead">We believe health and wellness should be accessible to everyone.</p>
                <p>
                Ascend was founded by a team of nutrition experts and fitness enthusiasts who wanted to create a more 
                personalized approach to health. Our science-backed methods and user-friendly tools help you create 
                sustainable habits that last a lifetime.
                </p>
                <p>
                Whether you're looking to lose weight, gain muscle, improve your energy, or simply establish healthier 
                eating habits, Ascend provides the guidance and support you need to reach your goals.
                </p>
                <a href="#get-started" className="about-cta">Start Your Journey</a>
            </div>
            <div className="about-image">
                <img src="/api/placeholder/400/400" alt="About Ascend" />
            </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
            <div className="section-heading">
            <h2>Success Stories</h2>
            <p>Hear from members who've transformed their lives with Ascend</p>
            </div>
            <div className="testimonials">
            {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="testimonial-author">
                    <div className="author-avatar">
                        <img src={`/api/placeholder/50/50`} alt={testimonial.name} />
                    </div>
                    <div className="author-info">
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.role}</p>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="pricing-section">
            <div className="section-heading">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your needs</p>
            </div>
            <div className="pricing-plans">
            <div className="pricing-card">
                <div className="pricing-header">
                <h3>Basic</h3>
                <div className="pricing-amount">
                    <span className="price">Free</span>
                </div>
                <p>Perfect for beginners</p>
                </div>
                <div className="pricing-features">
                <ul>
                    <li><CheckCircle size={16} className="check-icon" /> Basic meal planning</li>
                    <li><CheckCircle size={16} className="check-icon" /> Workout library access</li>
                    <li><CheckCircle size={16} className="check-icon" /> Progress tracking</li>
                </ul>
                </div>
                <a href="/signup" className="pricing-cta">Get Started</a>
            </div>
            
            <div className="pricing-card featured">
                <div className="pricing-badge">Most Popular</div>
                <div className="pricing-header">
                <h3>Premium</h3>
                <div className="pricing-amount">
                    <span className="currency">$</span>
                    <span className="price">12</span>
                    <span className="period">/month</span>
                </div>
                <p>For serious health enthusiasts</p>
                </div>
                <div className="pricing-features">
                <ul>
                    <li><CheckCircle size={16} className="check-icon" /> Everything in Basic</li>
                    <li><CheckCircle size={16} className="check-icon" /> Personalized meal plans</li>
                    <li><CheckCircle size={16} className="check-icon" /> Custom workout programs</li>
                    <li><CheckCircle size={16} className="check-icon" /> Weekly check-ins</li>
                </ul>
                </div>
                <a href="/signup" className="pricing-cta">Get Premium</a>
            </div>
            
            <div className="pricing-card">
                <div className="pricing-header">
                <h3>Ultimate</h3>
                <div className="pricing-amount">
                    <span className="currency">$</span>
                    <span className="price">29</span>
                    <span className="period">/month</span>
                </div>
                <p>For maximum results</p>
                </div>
                <div className="pricing-features">
                <ul>
                    <li><CheckCircle size={16} className="check-icon" /> Everything in Premium</li>
                    <li><CheckCircle size={16} className="check-icon" /> 1-on-1 expert coaching</li>
                    <li><CheckCircle size={16} className="check-icon" /> Priority support</li>
                    <li><CheckCircle size={16} className="check-icon" /> Advanced analytics</li>
                </ul>
                </div>
                <a href="/signup" className="pricing-cta">Get Ultimate</a>
            </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
            <div className="cta-content">
            <h2>Ready to Transform Your Health?</h2>
            <p>Join thousands of members who have already changed their lives with Ascend.</p>
            <a href="#get-started" className="cta-btn cta-btn-large">Start Your Free Trial</a>
            </div>
        </section>

        {/* Footer */}
        <footer className="footer">
            <div className="footer-content">
            <div className="footer-section">
                <div className="footer-logo">
                <span className="logo-text">Ascend</span>
                </div>
                <p className="footer-tagline">Your journey to a healthier life starts here.</p>
                <div className="footer-social">
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">Instagram</a>
                <a href="#" className="social-link">Facebook</a>
                </div>
            </div>
            
            <div className="footer-links">
                <div className="footer-link-group">
                <h4>Product</h4>
                <ul>
                    <li><a href="#">Features</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">Testimonials</a></li>
                    <li><a href="#">FAQ</a></li>
                </ul>
                </div>
                
                <div className="footer-link-group">
                <h4>Company</h4>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Blog</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
                </div>
                
                <div className="footer-link-group">
                <h4>Resources</h4>
                <ul>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Cookie Policy</a></li>
                </ul>
                </div>
            </div>
            </div>
            <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Ascend Health & Nutrition. All rights reserved.</p>
            </div>
        </footer>
        </div>
    );
    };

    export default LandingPage;