import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Mail, Lock, Eye, EyeOff, ChevronRight, HelpCircle } from 'lucide-react';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDemo, setShowDemo] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Realistic simulation of authentication
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1200);
    };

    return (
        <div className="login-container">
            {/* Maritime Background Slideshow - Explicitly Ships */}
            <div className="slideshow">
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="slide"></div>
                <div className="overlay"></div>
            </div>

            {/* Auth Interface Wrapper */}
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="brand-icon-rounded">
                            <Ship size={36} />
                        </div>
                        <h1>EnviGuide IHM</h1>
                        <p>Maritime Compliance Solutions</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-field">
                            <label htmlFor="email">Work Email</label>
                            <div className="input-container">
                                <Mail size={18} className="field-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="name@maritime.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Security Password</label>
                            <div className="input-container">
                                <Lock size={18} className="field-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="auth-utils">
                            <label className="remember-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Trust this device</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot Key?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary-auth"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Decrypting...' : 'Secure Entry'}
                            {!isLoading && <ChevronRight size={20} />}
                        </button>

                        <div className="demo-section">
                            <button
                                type="button"
                                className="demo-trigger"
                                onClick={() => setShowDemo(!showDemo)}
                            >
                                <HelpCircle size={14} />
                                <span>First time visiting? Get Demo credentials</span>
                            </button>
                            {showDemo && (
                                <div className="demo-details">
                                    Email: <strong>admin@maritime.com</strong><br />
                                    Password: <strong>demo123</strong>
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>No access? <a href="#">Request Client Portal</a></p>
                    </div>
                </div>
            </div>

            {/* Bottom Global Footer */}
            <div className="global-legal-footer">
                <p>&copy; 2026 EnviGuide IHM • System Identity Management • ISO 27001 Certified</p>
                <div className="legal-links">
                    <a href="#">Privacy Protocol</a>
                    <a href="#">Network Terms</a>
                    <a href="#">Audit Logs</a>
                </div>
            </div>
        </div>
    );
}
