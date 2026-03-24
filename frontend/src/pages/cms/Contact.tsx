import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Mail, Phone, MapPin, Send, Ship, Anchor } from 'lucide-react';
import './Contact.css';

export default function Contact() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className="contact-premium-container">
            <Sidebar />
            <main className="contact-viewport">
                <Header />
                <div className="contact-frame">
                    <section className="contact-intro">
                        <div className="maritime-badge">
                            <Anchor size={14} />
                            <span>Vessel Support Deck</span>
                        </div>
                        <h1>Contact Our Fleet</h1>
                        <p>High-precision support for global maritime safety management. Reach out to our leads for immediate assistance.</p>
                    </section>

                    <div className="contact-layout-grid">
                        <div className="form-column">
                            <form onSubmit={handleSubmit} className="minimal-blueprint-form">
                                <div className="input-row">
                                    <div className="minimal-group">
                                        <label>Full Name</label>
                                        <input type="text" placeholder="John Administrator" required />
                                    </div>
                                    <div className="minimal-group">
                                        <label>Company</label>
                                        <input type="text" placeholder="Fleet Operations" />
                                    </div>
                                </div>
                                <div className="minimal-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="admin@vessel-fleet.com" required />
                                </div>
                                <div className="minimal-group">
                                    <label>Brief Message</label>
                                    <textarea rows={4} placeholder="What is your current coordinate/issue?" required></textarea>
                                </div>
                                <button type="submit" className="ship-command-btn">
                                    <span>Transmit Message</span>
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>

                        <div className="contact-details-column">
                            <div className="detail-item">
                                <div className="detail-icon"><Mail size={20} /></div>
                                <div className="detail-content">
                                    <h3>Signal Channel</h3>
                                    <p>ops@ihmplatform.com</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><Phone size={20} /></div>
                                <div className="detail-content">
                                    <h3>Direct Line</h3>
                                    <p>+1 (800) MARITIME</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-icon"><MapPin size={20} /></div>
                                <div className="detail-content">
                                    <h3>Port Base</h3>
                                    <p>Suite 400, Maritime Plaza, London</p>
                                </div>
                            </div>
                            <div className="nautical-seal">
                                <Ship size={40} className="seal-icon" />
                                <span>Est. 2026</span>
                            </div>
                        </div>
                    </div>

                    <footer className="contact-footer">
                        <div className="copyright">
                            <Ship size={16} />
                            <span>&copy; 2026 IHM Platform. Maritime Safety Standard.</span>
                        </div>
                        <nav className="footer-nav">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Fleet Status</a>
                        </nav>
                    </footer>
                </div>
            </main>
        </div>
    );
}
