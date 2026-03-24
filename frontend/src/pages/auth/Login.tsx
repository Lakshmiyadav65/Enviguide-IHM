import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

// Import moody slide images
import slide1 from '../../assets/login-slide-1.png';
import slide2 from '../../assets/login-slide-2.png';
import slide3 from '../../assets/login-slide-3.png';

export default function Login() {
    const navigate = useNavigate();
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showForgotMsg, setShowForgotMsg] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [slide1, slide2, slide3];

    // Redirect if already authenticated
    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [auth.isAuthenticated, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await auth.login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError((err as Error).message || 'Login failed');
        }
    };

    return (
        <div className="login-viewport">
            {/* Left Panel: Moody Slideshow */}
            <div className="visual-side">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`slide-v2 ${index === currentSlide ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${slide})` }}
                    ></div>
                ))}
                <div className="visual-overlay"></div>
                <div className="visual-caption">
                    <span className="tiny-label">IHM Management</span>
                </div>
            </div>

            {/* Right Panel: Clean Auth Portal */}
            <div className="form-side">
                <div className="auth-content">
                    <div className="auth-header-v2">
                        <div className="brand-pill">
                            <Ship size={20} />
                            <span>EnviGuide IHM</span>
                        </div>
                        <h2>Welcome Back</h2>
                        <p>Access your secure maritime dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="form-group-v2">
                            <label>Portal Email</label>
                            <div className="input-row-v2">
                                <Mail size={16} className="icon-v2" />
                                <input
                                    type="email"
                                    placeholder="name@enviguide.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-v2">
                            <label>Access Key</label>
                            <div className="input-row-v2">
                                <Lock size={16} className="icon-v2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-utils-v2">
                            <label className="remember-v2">
                                <input type="checkbox" />
                                <span className="mark"></span>
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-v2" onClick={(e) => { e.preventDefault(); setShowForgotMsg(true); }}>Forgot Password?</a>
                        </div>

                        {showForgotMsg && (
                            <div style={{ color: '#3b82f6', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px' }}>
                                Please reach out to the Enviguide team for password assistance.
                            </div>
                        )}

                        {error && (
                            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-blocker"
                            disabled={auth.isLoading}
                        >
                            {auth.isLoading ? (
                                <div className="dot-loading-container">
                                    <div className="dot-v2"></div>
                                    <div className="dot-v2"></div>
                                    <div className="dot-v2"></div>
                                </div>
                            ) : "Sign In"}
                        </button>

                    </form>
                </div>

                <footer className="auth-footer-v2">
                    <p>&copy; 2026 EnviGuide IHM &bull; ISO 27001 Certified</p>
                </footer>
            </div>
        </div>
    );
}


