import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
} from 'firebase/firestore';

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyBoro_dYlErRtMy7rjUeI0GIUMS8jDmcMU",
    authDomain: "shareplate-42f7e.firebaseapp.com",
    projectId: "shareplate-42f7e",
    storageBucket: "shareplate-42f7e.firebasestorage.app",
    messagingSenderId: "557320721156",
    appId: "1:557320721156:web:cb24268804fe6b9220b651",
    measurementId: "G-QLSC8TEM7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ============================================
// MAIN APP COMPONENT WITH ROUTER
// ============================================
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Loading SharePlate...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/home" />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/home" element={user ? <HomePage user={user} /> : <Navigate to="/login" />} />
                <Route path="/about" element={user ? <AboutPage user={user} /> : <Navigate to="/login" />} />
                <Route path="/provider" element={user ? <ProviderPage user={user} /> : <Navigate to="/login" />} />
                <Route path="/receiver" element={user ? <ReceiverPage user={user} /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
            </Routes>
        </Router>
    );
}

// ============================================
// LOGIN PAGE
// ============================================
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/home');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.authContainer}>
            <div style={styles.authCard}>
                <h1 style={styles.authLogo}>🍽️ SharePlate</h1>
                <p style={styles.authSubtitle}>Connecting surplus food to those who need it</p>

                <form onSubmit={handleLogin} style={styles.authForm}>
                    <h2 style={styles.authTitle}>Login</h2>

                    {successMessage && <div style={{ ...styles.errorMessage, backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#34d399' }}>{successMessage}</div>}

                    {error && <div style={styles.errorMessage}>{error}</div>}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.authInput}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.authInput}
                        required
                    />

                    <button
                        type="submit"
                        style={styles.authButton}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <p style={styles.authLink}>
                        Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

// ============================================
// REGISTER PAGE
// ============================================
function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters!');
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await signOut(auth); // Sign out immediately
            navigate('/login', { state: { message: 'Registration successful! Please login with your new credentials.' } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.authContainer}>
            <div style={styles.authCard}>
                <h1 style={styles.authLogo}>🍽️ SharePlate</h1>
                <p style={styles.authSubtitle}>Join us in reducing food waste</p>

                <form onSubmit={handleRegister} style={styles.authForm}>
                    <h2 style={styles.authTitle}>Register</h2>

                    {error && <div style={styles.errorMessage}>{error}</div>}

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.authInput}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.authInput}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.authInput}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.authInput}
                        required
                    />

                    <button
                        type="submit"
                        style={styles.authButton}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>

                    <p style={styles.authLink}>
                        Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

// ============================================
// NAVBAR COMPONENT
// ============================================
function Navbar({ user }) {
    const navigate = useNavigate();
    const [activeLink, setActiveLink] = useState(window.location.pathname);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navContent}>
                <h1 style={styles.navLogo}>🍽️ SharePlate</h1>
                <div style={styles.navLinks}>
                    <Link
                        to="/home"
                        style={{ ...styles.navLink, ...(activeLink === '/home' ? styles.navLinkActive : {}) }}
                        onClick={() => setActiveLink('/home')}
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        style={{ ...styles.navLink, ...(activeLink === '/about' ? styles.navLinkActive : {}) }}
                        onClick={() => setActiveLink('/about')}
                    >
                        About
                    </Link>
                    <Link
                        to="/provider"
                        style={{ ...styles.navLink, ...(activeLink === '/provider' ? styles.navLinkActive : {}) }}
                        onClick={() => setActiveLink('/provider')}
                    >
                        Provider
                    </Link>
                    <Link
                        to="/receiver"
                        style={{ ...styles.navLink, ...(activeLink === '/receiver' ? styles.navLinkActive : {}) }}
                        onClick={() => setActiveLink('/receiver')}
                    >
                        Receiver
                    </Link>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

// ============================================
// FOOTER COMPONENT
// ============================================
function Footer() {
    return (
        <>
            <style>
                {` 
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .footer-icon {
                    animation: float 3s ease-in-out infinite;
                }
                
                .footer-badge:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
            <footer style={styles.footer}>
                <div style={styles.footerOverlay}></div>
                <div style={styles.footerContent}>
                    <div className="footer-icon" style={styles.footerIcon}>🍽️</div>
                    <p style={styles.footerText}>
                        💚 SharePlate - Making a difference, one meal at a time
                    </p>
                    <div style={styles.footerDivider}></div>
                    <p style={styles.footerCredit}>
                        Developed with ❤️ by <strong>Sanjay Panneerselvan</strong> and Team
                    </p>
                    <div style={styles.footerSocial}>
                        <span className="footer-badge" style={styles.footerBadge}>🌍 Reducing Food Waste</span>
                        <span className="footer-badge" style={styles.footerBadge}>🤝 Building Communities</span>
                        <span className="footer-badge" style={styles.footerBadge}>💪 Fighting Hunger</span>
                    </div>
                </div>
            </footer>
        </>
    );
}

// ============================================
// HOME PAGE
// ============================================
function HomePage({ user }) {
    const navigate = useNavigate();

    return (
        <div style={styles.pageContainer}>
            <Navbar user={user} />

            <main style={styles.homeMain}>
                <div style={styles.homeContent}>
                    <h1 style={styles.homeTitle}>Welcome to SharePlate! 🎉</h1>
                    <p style={styles.homeGreeting}>
                        Hello, <strong>{user.displayName || user.email}</strong>
                    </p>
                    <p style={styles.homeDescription}>
                        Choose how you'd like to make a difference today
                    </p>

                    <div style={styles.homeCards}>
                        <div
                            style={styles.homeCard}
                            onClick={() => navigate('/provider')}
                        >
                            <div style={styles.homeCardIcon}>🍱</div>
                            <h2 style={styles.homeCardTitle}>I Want to Provide Food</h2>
                            <p style={styles.homeCardText}>
                                Share your surplus food with those who need it
                            </p>
                            <button style={styles.homeCardButton}>Get Started →</button>
                        </div>

                        <div
                            style={styles.homeCard}
                            onClick={() => navigate('/receiver')}
                        >
                            <div style={styles.homeCardIcon}>🙏</div>
                            <h2 style={styles.homeCardTitle}>I Need Food (Receiver)</h2>
                            <p style={styles.homeCardText}>
                                Find available food donations near you
                            </p>
                            <button style={styles.homeCardButton}>Get Started →</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ============================================
// ABOUT PAGE
// ============================================
function AboutPage({ user }) {
    return (
        <div style={styles.pageContainer}>
            <Navbar user={user} />

            <main style={styles.aboutMain}>
                <div style={styles.aboutContent}>
                    <h1 style={styles.aboutTitle}>About SharePlate</h1>

                    <div style={styles.aboutSection}>
                        <div style={styles.illustrationCircle}></div>
                        <h2 style={styles.aboutSubtitle}>Our Mission</h2>
                        <p style={styles.aboutText}>
                            SharePlate is dedicated to reducing food waste while helping those in need.
                            We connect food providers—restaurants, events, homes, and mess halls—with
                            receivers such as NGOs, shelters, and individuals who can benefit from surplus food.
                        </p>
                    </div>

                    <div style={styles.aboutSection}>
                        <div style={styles.illustrationSquare}></div>
                        <h2 style={styles.aboutSubtitle}>Why Food Sharing Matters</h2>
                        <p style={styles.aboutText}>
                            Every year, millions of tons of food go to waste while many people struggle
                            with hunger. By sharing surplus food, we can:
                        </p>
                        <ul style={styles.aboutList}>
                            <li style={styles.aboutListItem}>✓ Reduce environmental impact from food waste</li>
                            <li style={styles.aboutListItem}>✓ Help feed those experiencing food insecurity</li>
                            <li style={styles.aboutListItem}>✓ Build stronger, more caring communities</li>
                            <li style={styles.aboutListItem}>✓ Make efficient use of resources</li>
                        </ul>
                    </div>

                    <div style={styles.aboutSection}>
                        <div style={styles.illustrationTriangle}></div>
                        <h2 style={styles.aboutSubtitle}>How It Works</h2>
                        <p style={styles.aboutText}>
                            Providers post available surplus food with details like quantity, type, and location.
                            Receivers browse these offers and can claim food that meets their needs.
                            Our real-time tracking system ensures smooth coordination from posting to delivery.
                        </p>
                    </div>

                    <div style={styles.aboutCTA}>
                        <h2 style={styles.aboutCTATitle}>Join Us in Making a Difference</h2>
                        <p style={styles.aboutCTAText}>
                            Together, we can end food waste and hunger, one meal at a time.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ============================================
// PROVIDER PAGE
// ============================================
function ProviderPage({ user }) {
    const [foodRequests, setFoodRequests] = useState([]);
    const [notification, setNotification] = useState(null);
    const [locationFilter, setLocationFilter] = useState('');
    const [foodTypeFilter, setFoodTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [providerForm, setProviderForm] = useState({
        providerName: '',
        contact: '',
        location: '',
        quantity: '',
        foodType: 'Veg',
        category: 'Cooked',
        preparedAt: '',
        bestBefore: '',
        notes: ''
    });

    useEffect(() => {
        const requestsQuery = query(collection(db, 'foodRequests'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFoodRequests(requests);
        });
        return unsubscribe;
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProviderSubmit = async (e) => {
        e.preventDefault();

        if (!providerForm.providerName || !providerForm.contact || !providerForm.location || !providerForm.quantity) {
            showNotification('Please fill in all required fields!', 'error');
            return;
        }

        try {
            await addDoc(collection(db, 'foodOffers'), {
                ...providerForm,
                status: 'Posted',
                createdAt: serverTimestamp(),
                userEmail: user.email,
                acceptedByName: null,
                acceptedByContact: null
            });

            showNotification('Food offer posted successfully! 🎉');

            setProviderForm({
                providerName: '',
                contact: '',
                location: '',
                quantity: '',
                foodType: 'Veg',
                category: 'Cooked',
                preparedAt: '',
                bestBefore: '',
                notes: ''
            });
        } catch (error) {
            console.error('Error adding document: ', error);
            showNotification('Error posting food offer. Please try again.', 'error');
        }
    };

    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            const requestRef = doc(db, 'foodRequests', requestId);
            await updateDoc(requestRef, { status: newStatus });
            showNotification(`Status updated to: ${newStatus}`);
        } catch (error) {
            console.error('Error updating status: ', error);
            showNotification('Error updating status. Please try again.', 'error');
        }
    };

    const filterItems = (items) => {
        return items.filter(item => {
            const locationMatch = !locationFilter ||
                item.location?.toLowerCase().includes(locationFilter.toLowerCase());
            const foodTypeMatch = foodTypeFilter === 'All' ||
                item.preferredFoodType === foodTypeFilter || item.preferredFoodType === 'Any';
            const statusMatch = statusFilter === 'All' || item.status === statusFilter;
            return locationMatch && foodTypeMatch && statusMatch;
        });
    };

    return (
        <div style={styles.pageContainer}>
            <Navbar user={user} />

            {notification && (
                <div style={{
                    ...styles.notification,
                    backgroundColor: notification.type === 'success' ? '#1FAF4C' : '#ef4444'
                }}>
                    {notification.message}
                </div>
            )}

            <main style={styles.contentMain}>
                <div style={styles.contentWrapper}>
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Post Surplus Food</h2>
                        <form onSubmit={handleProviderSubmit} style={styles.form}>
                            <input
                                type="text"
                                placeholder="Provider Name *"
                                value={providerForm.providerName}
                                onChange={(e) => setProviderForm({ ...providerForm, providerName: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Contact Number / WhatsApp *"
                                value={providerForm.contact}
                                onChange={(e) => setProviderForm({ ...providerForm, contact: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location / Address *"
                                value={providerForm.location}
                                onChange={(e) => setProviderForm({ ...providerForm, location: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Quantity (e.g., 50 plates, 10 packs) *"
                                value={providerForm.quantity}
                                onChange={(e) => setProviderForm({ ...providerForm, quantity: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <select
                                value={providerForm.foodType}
                                onChange={(e) => setProviderForm({ ...providerForm, foodType: e.target.value })}
                                style={styles.select}
                            >
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                            <select
                                value={providerForm.category}
                                onChange={(e) => setProviderForm({ ...providerForm, category: e.target.value })}
                                style={styles.select}
                            >
                                <option value="Cooked">Cooked</option>
                                <option value="Packaged">Packaged</option>
                                <option value="Bakery">Bakery</option>
                                <option value="Others">Others</option>
                            </select>
                            <input
                                type="datetime-local"
                                placeholder="Time of Preparation"
                                value={providerForm.preparedAt}
                                onChange={(e) => setProviderForm({ ...providerForm, preparedAt: e.target.value })}
                                style={styles.input}
                            />
                            <input
                                type="datetime-local"
                                placeholder="Best Before / Safe Till"
                                value={providerForm.bestBefore}
                                onChange={(e) => setProviderForm({ ...providerForm, bestBefore: e.target.value })}
                                style={styles.input}
                            />
                            <textarea
                                placeholder="Additional Notes (spice level, allergens, etc.)"
                                value={providerForm.notes}
                                onChange={(e) => setProviderForm({ ...providerForm, notes: e.target.value })}
                                style={styles.textarea}
                                rows="3"
                            />
                            <button type="submit" style={styles.submitButton}>
                                Post Food Offer 🚀
                            </button>
                        </form>
                    </div>

                    <div style={styles.listSection}>
                        <h2 style={styles.sectionTitle}>Active Food Requests</h2>

                        <div style={styles.filters}>
                            <input
                                type="text"
                                placeholder="🔍 Filter by location..."
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                style={styles.filterInput}
                            />
                            <select
                                value={foodTypeFilter}
                                onChange={(e) => setFoodTypeFilter(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="All">All Types</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Any">Any</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="All">All Status</option>
                                <option value="Looking">Looking</option>
                                <option value="Matched">Matched</option>
                                <option value="Fulfilled">Fulfilled</option>
                            </select>
                        </div>

                        <div style={styles.cardGrid}>
                            {filterItems(foodRequests).map(request => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onUpdateStatus={updateRequestStatus}
                                />
                            ))}
                            {filterItems(foodRequests).length === 0 && (
                                <p style={styles.emptyMessage}>No food requests yet. Check back soon! 🔄</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ============================================
// RECEIVER PAGE
// ============================================
function ReceiverPage({ user }) {
    const [foodOffers, setFoodOffers] = useState([]);
    const [notification, setNotification] = useState(null);
    const [locationFilter, setLocationFilter] = useState('');
    const [foodTypeFilter, setFoodTypeFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [receiverForm, setReceiverForm] = useState({
        receiverName: '',
        orgName: '',
        contact: '',
        location: '',
        requiredQuantity: '',
        preferredFoodType: 'Any',
        timeWindow: '',
        notes: ''
    });

    useEffect(() => {
        const offersQuery = query(collection(db, 'foodOffers'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(offersQuery, (snapshot) => {
            const offers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFoodOffers(offers);
        });
        return unsubscribe;
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleReceiverSubmit = async (e) => {
        e.preventDefault();

        if (!receiverForm.receiverName || !receiverForm.contact || !receiverForm.location || !receiverForm.requiredQuantity) {
            showNotification('Please fill in all required fields!', 'error');
            return;
        }

        try {
            await addDoc(collection(db, 'foodRequests'), {
                ...receiverForm,
                status: 'Looking',
                createdAt: serverTimestamp(),
                userEmail: user.email,
                matchedOfferId: null
            });

            showNotification('Food request posted successfully! 🙌');

            setReceiverForm({
                receiverName: '',
                orgName: '',
                contact: '',
                location: '',
                requiredQuantity: '',
                preferredFoodType: 'Any',
                timeWindow: '',
                notes: ''
            });
        } catch (error) {
            console.error('Error adding document: ', error);
            showNotification('Error posting food request. Please try again.', 'error');
        }
    };

    const updateOfferStatus = async (offerId, newStatus, acceptorInfo = {}) => {
        try {
            const offerRef = doc(db, 'foodOffers', offerId);
            await updateDoc(offerRef, {
                status: newStatus,
                ...acceptorInfo
            });
            showNotification(`Status updated to: ${newStatus}`);
        } catch (error) {
            console.error('Error updating status: ', error);
            showNotification('Error updating status. Please try again.', 'error');
        }
    };

    const filterItems = (items) => {
        return items.filter(item => {
            const locationMatch = !locationFilter ||
                item.location?.toLowerCase().includes(locationFilter.toLowerCase());
            const foodTypeMatch = foodTypeFilter === 'All' || item.foodType === foodTypeFilter;
            const statusMatch = statusFilter === 'All' || item.status === statusFilter;
            return locationMatch && foodTypeMatch && statusMatch;
        });
    };

    return (
        <div style={styles.pageContainer}>
            <Navbar user={user} />

            {notification && (
                <div style={{
                    ...styles.notification,
                    backgroundColor: notification.type === 'success' ? '#1FAF4C' : '#ef4444'
                }}>
                    {notification.message}
                </div>
            )}

            <main style={styles.contentMain}>
                <div style={styles.contentWrapper}>
                    <div style={styles.formSection}>
                        <h2 style={styles.sectionTitle}>Post Food Requirement</h2>
                        <form onSubmit={handleReceiverSubmit} style={styles.form}>
                            <input
                                type="text"
                                placeholder="Your Name / Organization Name *"
                                value={receiverForm.receiverName}
                                onChange={(e) => setReceiverForm({ ...receiverForm, receiverName: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Organization Name (optional)"
                                value={receiverForm.orgName}
                                onChange={(e) => setReceiverForm({ ...receiverForm, orgName: e.target.value })}
                                style={styles.input}
                            />
                            <input
                                type="tel"
                                placeholder="Contact Number / WhatsApp *"
                                value={receiverForm.contact}
                                onChange={(e) => setReceiverForm({ ...receiverForm, contact: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location / Address *"
                                value={receiverForm.location}
                                onChange={(e) => setReceiverForm({ ...receiverForm, location: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Required Quantity (e.g., 100 meals) *"
                                value={receiverForm.requiredQuantity}
                                onChange={(e) => setReceiverForm({ ...receiverForm, requiredQuantity: e.target.value })}
                                style={styles.input}
                                required
                            />
                            <select
                                value={receiverForm.preferredFoodType}
                                onChange={(e) => setReceiverForm({ ...receiverForm, preferredFoodType: e.target.value })}
                                style={styles.select}
                            >
                                <option value="Any">Any</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Time Window (e.g., 6 PM - 8 PM)"
                                value={receiverForm.timeWindow}
                                onChange={(e) => setReceiverForm({ ...receiverForm, timeWindow: e.target.value })}
                                style={styles.input}
                            />
                            <textarea
                                placeholder="Additional Notes (dietary restrictions, preferences, etc.)"
                                value={receiverForm.notes}
                                onChange={(e) => setReceiverForm({ ...receiverForm, notes: e.target.value })}
                                style={styles.textarea}
                                rows="3"
                            />
                            <button type="submit" style={styles.submitButton}>
                                Post Food Request 🙌
                            </button>
                        </form>
                    </div>

                    <div style={styles.listSection}>
                        <h2 style={styles.sectionTitle}>Available Food Offers</h2>

                        <div style={styles.filters}>
                            <input
                                type="text"
                                placeholder="🔍 Filter by location..."
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                style={styles.filterInput}
                            />
                            <select
                                value={foodTypeFilter}
                                onChange={(e) => setFoodTypeFilter(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="All">All Types</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="All">All Status</option>
                                <option value="Posted">Posted</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Picked Up">Picked Up</option>
                                <option value="On the Way">On the Way</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>

                        <div style={styles.cardGrid}>
                            {filterItems(foodOffers).map(offer => (
                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    onUpdateStatus={updateOfferStatus}
                                />
                            ))}
                            {filterItems(foodOffers).length === 0 && (
                                <p style={styles.emptyMessage}>No food offers yet. Check back soon! 🔄</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// ============================================
// OFFER CARD COMPONENT
// ============================================
function OfferCard({ offer, onUpdateStatus }) {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            'Posted': '#1FAF4C',
            'Accepted': '#9ACD32',
            'Picked Up': '#20B2AA',
            'On the Way': '#20B2AA',
            'Delivered': '#006400'
        };
        return colors[status] || '#6b7280';
    };

    const statusSteps = ['Posted', 'Accepted', 'Picked Up', 'On the Way', 'Delivered'];
    const currentStepIndex = statusSteps.indexOf(offer.status);

    return (
        <div
            style={{
                ...styles.card,
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 8px 20px rgba(31, 175, 76, 0.2)' : '0 4px 12px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{offer.providerName}</h3>
                <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(offer.status)
                }}>
                    {offer.status}
                </span>
            </div>

            <div style={styles.cardContent}>
                <div style={styles.infoRow}>
                    <span style={styles.icon}>📍</span>
                    <span>{offer.location}</span>
                </div>
                <div style={styles.infoRow}>
                    <span style={styles.icon}>🍱</span>
                    <span>{offer.quantity} - {offer.foodType}</span>
                </div>
                <div style={styles.infoRow}>
                    <span style={styles.icon}>📦</span>
                    <span>{offer.category}</span>
                </div>
                {offer.preparedAt && (
                    <div style={styles.infoRow}>
                        <span style={styles.icon}>⏰</span>
                        <span>Prepared: {new Date(offer.preparedAt).toLocaleString()}</span>
                    </div>
                )}
                {offer.bestBefore && (
                    <div style={styles.infoRow}>
                        <span style={styles.icon}>⚠️</span>
                        <span>Best before: {new Date(offer.bestBefore).toLocaleString()}</span>
                    </div>
                )}
                {offer.notes && (
                    <div style={styles.infoRow}>
                        <span style={styles.icon}>📝</span>
                        <span style={styles.notes}>{offer.notes}</span>
                    </div>
                )}
                <div style={styles.infoRow}>
                    <span style={styles.icon}>📞</span>
                    <a href={`tel:${offer.contact}`} style={styles.contactLink}>{offer.contact}</a>
                </div>
            </div>

            <div style={styles.progressTracker}>
                {statusSteps.map((step, index) => (
                    <div key={step} style={styles.progressStep}>
                        <div style={{
                            ...styles.progressDot,
                            backgroundColor: index <= currentStepIndex ? getStatusColor(step) : '#e5e7eb'
                        }}>
                            {index <= currentStepIndex && '✓'}
                        </div>
                        {index < statusSteps.length - 1 && (
                            <div style={{
                                ...styles.progressLine,
                                backgroundColor: index < currentStepIndex ? getStatusColor(step) : '#e5e7eb'
                            }} />
                        )}
                    </div>
                ))}
            </div>
            <div style={styles.progressLabels}>
                {statusSteps.map((step, index) => (
                    <span key={step} style={{
                        ...styles.progressLabel,
                        color: index <= currentStepIndex ? '#1f2937' : '#9ca3af',
                        fontWeight: index === currentStepIndex ? 'bold' : 'normal'
                    }}>
                        {step}
                    </span>
                ))}
            </div>

            <div style={styles.cardActions}>
                {offer.status === 'Posted' && (
                    <button
                        style={styles.actionButton}
                        onClick={() => onUpdateStatus(offer.id, 'Accepted', {
                            acceptedByName: 'Receiver Name',
                            acceptedByContact: 'Contact'
                        })}
                    >
                        Claim This Food 🎯
                    </button>
                )}
                {offer.status === 'Accepted' && (
                    <button
                        style={styles.actionButton}
                        onClick={() => onUpdateStatus(offer.id, 'Picked Up')}
                    >
                        Mark as Picked Up 📦
                    </button>
                )}
                {offer.status === 'Picked Up' && (
                    <button
                        style={styles.actionButton}
                        onClick={() => onUpdateStatus(offer.id, 'On the Way')}
                    >
                        On the Way 🚚
                    </button>
                )}
                {offer.status === 'On the Way' && (
                    <button
                        style={styles.actionButton}
                        onClick={() => onUpdateStatus(offer.id, 'Delivered')}
                    >
                        Mark as Delivered ✅
                    </button>
                )}
            </div>
        </div>
    );
}

// ============================================
// REQUEST CARD COMPONENT
// ============================================
function RequestCard({ request, onUpdateStatus }) {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            'Looking': '#1FAF4C',
            'Matched': '#9ACD32',
            'Fulfilled': '#006400',
            'Cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    return (
        <div
            style={{
                ...styles.card,
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 8px 20px rgba(31, 175, 76, 0.2)' : '0 4px 12px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                    {request.receiverName}
                    {request.orgName && <span style={styles.orgName}> ({request.orgName})</span>}
                </h3>
                <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(request.status)
                }}>
                    {request.status}
                </span>
            </div>

            <div style={styles.cardContent}>
                <div style={styles.infoRow}>
                    <span style={styles.icon}>📍</span>
                    <span>{request.location}</span>
                </div>
                <div style={styles.infoRow}>
                    <span style={styles.icon}>🍽️</span>
                    <span>{request.requiredQuantity} - {request.preferredFoodType}</span>
                </div>
                {request.timeWindow && (
                    <div style={styles.infoRow}>
                        <span style={styles.icon}>⏰</span>
                        <span>Time: {request.timeWindow}</span>
                    </div>
                )}
                {request.notes && (
                    <div style={styles.infoRow}>
                        <span style={styles.icon}>📝</span>
                        <span style={styles.notes}>{request.notes}</span>
                    </div>
                )}
                <div style={styles.infoRow}>
                    <span style={styles.icon}>📞</span>
                    <a href={`tel:${request.contact}`} style={styles.contactLink}>{request.contact}</a>
                </div>
            </div>

            <div style={styles.cardActions}>
                {request.status === 'Looking' && (
                    <button
                        style={styles.actionButton}
                        onClick={() => onUpdateStatus(request.id, 'Matched')}
                    >
                        Accept Request 🤝
                    </button>
                )}
                {request.status === 'Matched' && (
                    <button
                        style={styles.actionButton}
                        onClick={() => onUpdateStatus(request.id, 'Fulfilled')}
                    >
                        Mark as Fulfilled ✅
                    </button>
                )}
            </div>
        </div>
    );
}

// ============================================
// STYLES - WHITE + GREEN THEME
// ============================================
const styles = {
    // Loading
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #1FAF4C',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '1rem',
        color: '#1FAF4C',
        fontSize: '1.1rem',
        fontWeight: '600',
    },

    // Auth Pages
    authContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #ffffff 100%)',
        padding: '2rem',
    },
    authCard: {
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 10px 40px rgba(31, 175, 76, 0.1)',
        maxWidth: '450px',
        width: '100%',
    },
    authLogo: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#1FAF4C',
        textAlign: 'center',
        margin: '0 0 0.5rem 0',
    },
    authSubtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    authForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    authTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1FAF4C',
        marginBottom: '1rem',
    },
    authInput: {
        padding: '0.9rem 1.2rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
    },
    authButton: {
        padding: '1rem 2rem',
        fontSize: '1.1rem',
        fontWeight: '700',
        border: 'none',
        borderRadius: '12px',
        background: '#1FAF4C',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '0.5rem',
    },
    authLink: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.95rem',
        marginTop: '1rem',
    },
    link: {
        color: '#1FAF4C',
        textDecoration: 'none',
        fontWeight: '600',
    },
    errorMessage: {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
    },

    // Navbar
    navbar: {
        background: 'white',
        borderBottom: '2px solid #E8F5E9',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    navContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    navLogo: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: '#1FAF4C',
        margin: 0,
    },
    navLinks: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
    },
    navLink: {
        color: '#4b5563',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '1rem',
        padding: '0.5rem 0',
        borderBottom: '3px solid transparent',
        transition: 'all 0.3s ease',
    },
    navLinkActive: {
        color: '#1FAF4C',
        borderBottom: '3px solid #1FAF4C',
    },
    logoutButton: {
        padding: '0.6rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        border: '2px solid #1FAF4C',
        borderRadius: '8px',
        background: 'white',
        color: '#1FAF4C',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },

    // Page Container
    pageContainer: {
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: 'flex',
        flexDirection: 'column',
    },

    // Home Page
    homeMain: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
    },
    homeContent: {
        textAlign: 'center',
    },
    homeTitle: {
        fontSize: '3rem',
        fontWeight: '800',
        color: '#1FAF4C',
        marginBottom: '1rem',
    },
    homeGreeting: {
        fontSize: '1.3rem',
        color: '#4b5563',
        marginBottom: '0.5rem',
    },
    homeDescription: {
        fontSize: '1.1rem',
        color: '#6b7280',
        marginBottom: '3rem',
    },
    homeCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '3rem',
    },
    homeCard: {
        background: 'white',
        border: '2px solid #E8F5E9',
        borderRadius: '20px',
        padding: '3rem 2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    homeCardIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
    },
    homeCardTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1FAF4C',
        marginBottom: '1rem',
    },
    homeCardText: {
        fontSize: '1rem',
        color: '#6b7280',
        marginBottom: '2rem',
    },
    homeCardButton: {
        padding: '0.8rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '10px',
        background: '#1FAF4C',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },

    // About Page
    aboutMain: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
    },
    aboutContent: {
        background: 'white',
    },
    aboutTitle: {
        fontSize: '3rem',
        fontWeight: '800',
        color: '#1FAF4C',
        marginBottom: '3rem',
        textAlign: 'center',
    },
    aboutSection: {
        marginBottom: '3rem',
        position: 'relative',
    },
    aboutSubtitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1FAF4C',
        marginBottom: '1rem',
    },
    aboutText: {
        fontSize: '1.1rem',
        color: '#4b5563',
        lineHeight: '1.8',
        marginBottom: '1rem',
    },
    aboutList: {
        listStyle: 'none',
        padding: 0,
        marginTop: '1rem',
    },
    aboutListItem: {
        fontSize: '1.1rem',
        color: '#4b5563',
        padding: '0.5rem 0',
        lineHeight: '1.8',
    },
    illustrationCircle: {
        position: 'absolute',
        top: '-20px',
        right: '20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        opacity: 0.6,
    },
    illustrationSquare: {
        position: 'absolute',
        top: '-15px',
        right: '30px',
        width: '70px',
        height: '70px',
        borderRadius: '15px',
        background: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
        opacity: 0.6,
        transform: 'rotate(15deg)',
    },
    illustrationTriangle: {
        position: 'absolute',
        top: '-10px',
        right: '40px',
        width: 0,
        height: 0,
        borderLeft: '40px solid transparent',
        borderRight: '40px solid transparent',
        borderBottom: '70px solid #E8F5E9',
        opacity: 0.6,
    },
    aboutCTA: {
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        borderRadius: '20px',
        padding: '3rem',
        textAlign: 'center',
        marginTop: '4rem',
    },
    aboutCTATitle: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1FAF4C',
        marginBottom: '1rem',
    },
    aboutCTAText: {
        fontSize: '1.2rem',
        color: '#4b5563',
    },

    // Content Pages (Provider/Receiver)
    contentMain: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
    },
    contentWrapper: {
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '2rem',
    },
    formSection: {
        background: 'white',
        border: '2px solid #E8F5E9',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        height: 'fit-content',
    },
    listSection: {
        background: 'white',
        border: '2px solid #E8F5E9',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#1FAF4C',
        marginBottom: '1.5rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    input: {
        padding: '0.9rem 1.2rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
    },
    select: {
        padding: '0.9rem 1.2rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        background: 'white',
        cursor: 'pointer',
    },
    textarea: {
        padding: '0.9rem 1.2rem',
        fontSize: '1rem',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        resize: 'vertical',
    },
    submitButton: {
        padding: '1rem 2rem',
        fontSize: '1.1rem',
        fontWeight: '700',
        border: 'none',
        borderRadius: '12px',
        background: '#1FAF4C',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '0.5rem',
    },
    filters: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
    },
    filterInput: {
        flex: '1',
        minWidth: '200px',
        padding: '0.8rem 1rem',
        fontSize: '0.95rem',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
    },
    filterSelect: {
        padding: '0.8rem 1rem',
        fontSize: '0.95rem',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        background: 'white',
        cursor: 'pointer',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        background: 'white',
        border: '2px solid #E8F5E9',
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s ease',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        gap: '0.5rem',
    },
    cardTitle: {
        fontSize: '1.3rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: 0,
    },
    orgName: {
        fontSize: '0.9rem',
        fontWeight: '400',
        color: '#6b7280',
    },
    statusBadge: {
        padding: '0.4rem 0.9rem',
        borderRadius: '20px',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: '600',
        whiteSpace: 'nowrap',
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.7rem',
        marginBottom: '1rem',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        fontSize: '0.95rem',
        color: '#4b5563',
    },
    icon: {
        fontSize: '1.1rem',
        minWidth: '24px',
    },
    notes: {
        fontStyle: 'italic',
        color: '#6b7280',
    },
    contactLink: {
        color: '#1FAF4C',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'color 0.2s ease',
    },
    progressTracker: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '0.5rem',
        padding: '1rem 0',
    },
    progressStep: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
    },
    progressDot: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        flexShrink: 0,
        transition: 'all 0.3s ease',
    },
    progressLine: {
        height: '3px',
        flex: 1,
        marginLeft: '4px',
        transition: 'all 0.3s ease',
    },
    progressLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
    },
    progressLabel: {
        fontSize: '0.7rem',
        textAlign: 'center',
        flex: 1,
        transition: 'all 0.3s ease',
    },
    cardActions: {
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    actionButton: {
        flex: 1,
        padding: '0.8rem 1.5rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '10px',
        background: '#1FAF4C',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '1.1rem',
        padding: '3rem',
        gridColumn: '1 / -1',
    },
    notification: {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '1rem 2rem',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease',
    },

    // Footer Styles
    footer: {
        position: 'relative',
        background: 'linear-gradient(135deg, #1FAF4C 0%, #178A3C 100%)',
        padding: '3rem 2rem',
        marginTop: 'auto',
        overflow: 'hidden',
    },
    footerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
    },
    footerContent: {
        position: 'relative',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        zIndex: 1,
    },
    footerIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
        display: 'inline-block',
    },
    footerText: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'white',
        marginBottom: '1rem',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    footerDivider: {
        width: '80px',
        height: '3px',
        background: 'rgba(255,255,255,0.5)',
        margin: '1.5rem auto',
        borderRadius: '2px',
    },
    footerCredit: {
        fontSize: '1rem',
        color: 'rgba(255,255,255,0.95)',
        marginBottom: '1.5rem',
        fontWeight: '500',
    },
    footerSocial: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '1.5rem',
    },
    footerBadge: {
        padding: '0.6rem 1.2rem',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px',
        fontSize: '0.9rem',
        color: 'white',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'default',
    },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  input:focus, select:focus, textarea:focus {
    border-color: #1FAF4C !important;
    box-shadow: 0 0 0 3px rgba(31, 175, 76, 0.1) !important;
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(31, 175, 76, 0.3);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  a:hover {
    color: #178A3C !important;
  }
  
  .homeCard:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(31, 175, 76, 0.15);
    border-color: #1FAF4C;
  }
  
  .logoutButton:hover {
    background: #1FAF4C !important;
    color: white !important;
  }
  
  @media (max-width: 968px) {
    .contentWrapper {
      grid-template-columns: 1fr !important;
    }
    .navLinks {
      flex-wrap: wrap;
      gap: 1rem !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default App;
