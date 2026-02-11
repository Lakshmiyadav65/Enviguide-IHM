import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Mail, Lock, Eye, EyeOff, Anchor, Shield, TrendingUp } from 'lucide-react';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="login-container">
            {/* Background Cargo Ship Images */}
            <div className="cargo-ship-background">
                <div className="ship-image ship-1"></div>
                <div className="ship-image ship-2"></div>
                <div className="ship-image ship-3"></div>
                <div className="overlay"></div>
            </div>

            {/* Main Content */}
            <div className="login-content">
                {/* Left Side - Branding Card */}
                <div className="branding-card">
                    <div className="branding-header">
                        <div className="logo-container-main">
                            <Ship size={48} className="logo-ship-icon" />
                        </div>
                        <h1 className="platform-title">IHM Platform</h1>
                        <p className="platform-subtitle">Maritime Safety & Compliance Management</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Ship size={28} />
                            </div>
                            <div className="stat-content">
                                <h3>500+</h3>
                                <p>Vessels Managed</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Shield size={28} />
                            </div>
                            <div className="stat-content">
                                <h3>98%</h3>
                                <p>Compliance Rate</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <TrendingUp size={28} />
                            </div>
                            <div className="stat-content">
                                <h3>24/7</h3>
                                <p>Real-Time Monitoring</p>
                            </div>
                        </div>
                    </div>

                    <div className="features-showcase">
                        <div className="feature-highlight">
                            <div className="feature-icon-circle">
                                <Anchor size={20} />
                            </div>
                            <div>
                                <h4>Vessel-Centric Control</h4>
                                <p>Complete IHM lifecycle management for your entire fleet</p>
                            </div>
                        </div>

                        <div className="feature-highlight">
                            <div className="feature-icon-circle">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <h4>End-to-End Traceability</h4>
                                <p>Track materials from purchase orders to certificates</p>
                            </div>
                        </div>

                        <div className="feature-highlight">
                            <div className="feature-icon-circle">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4>Regulatory Compliance</h4>
                                <p>EU 1257/2013 & Hong Kong Convention ready</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form Card */}
                <div className="login-form-card">
                    <div className="form-card-inner">
                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to manage your fleet's IHM compliance</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={20} className="input-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="admin@maritime.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span>Remember me</span>
                                </label>
                                <a href="#" className="forgot-password">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                className={`submit-button ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>

                        </form>

                        <div className="form-footer">
                            <p>
                                Don't have an account?{' '}
                                <a href="#" className="signup-link">Request Access</a>
                            </p>
                        </div>
                    </div>

                    <div className="login-footer">
                        <p>© 2026 IHM Platform. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#">Privacy</a>
                            <span>•</span>
                            <a href="#">Terms</a>
                            <span>•</span>
                            <a href="#">Support</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Separate Demo Hint - Moved outside cards for future-proofing */}
            <div className="floating-demo-hint">
                <div className="demo-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <span>DEMO ACCESS</span>
                </div>
                <div className="demo-hint-content">
                    <p>Email: <strong>admin@maritime.com</strong></p>
                    <p>Password: <strong>demo123</strong></p>
                </div>
            </div>
        </div>
    );
}
