import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ResourceModal from '../components/ResourceModal';
import AdminNewsModal from '../components/AdminNewsModal';

export default function AdminPage() {
  const { session, isAuthenticated, login, logout, updatePassword } = useAuth();
  const { resources, news, saveResourcesState, saveNewsState, showToast, autoSyncLocalToSupabase, formatDate } = useData();

  // Login Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState({ text: '', isSuccess: false });
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Shell state
  const [activeTab, setActiveTab] = useState('resources');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clockText, setClockText] = useState('');

  // Resource Modal state
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  // News Modal state
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  // Profile Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', isSuccess: false });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      autoSyncLocalToSupabase();
    }
  }, [isAuthenticated, autoSyncLocalToSupabase]);

  useEffect(() => {
    const updateClock = () => {
      const formatted = new Intl.DateTimeFormat("en", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date());
      setClockText(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage({ text: 'Signing in...', isSuccess: true });
    setLoginLoading(true);

    const res = await login(email, password);
    setLoginLoading(false);

    if (res.success) {
      setAuthMessage({ text: 'Login successful', isSuccess: true });
      showToast('Login successful');
    } else {
      setAuthMessage({ text: res.error, isSuccess: false });
      showToast(res.error);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    showToast('Logged out successfully');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ text: '', isSuccess: false });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setProfileMessage({ text: 'All fields are required.', isSuccess: false });
      return;
    }
    if (newPassword.length < 6) {
      setProfileMessage({ text: 'New password must be at least 6 characters.', isSuccess: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileMessage({ text: 'New passwords do not match.', isSuccess: false });
      return;
    }
    if (newPassword === currentPassword) {
      setProfileMessage({ text: 'New password must be different from current password.', isSuccess: false });
      return;
    }

    setProfileLoading(true);
    const res = await updatePassword(currentPassword, newPassword);
    setProfileLoading(false);

    if (res.success) {
      setProfileMessage({ text: 'Password updated successfully!', isSuccess: true });
      showToast('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setProfileMessage({ text: res.error, isSuccess: false });
    }
  };

  // Resource actions
  const openAddResource = () => {
    setEditingResource(null);
    setResourceModalOpen(true);
  };
  const openEditResource = (resource) => {
    setEditingResource(resource);
    setResourceModalOpen(true);
  };
  const handleDeleteResource = async (id) => {
    if (!window.confirm("Delete this resource? This action cannot be undone.")) return;
    const updated = resources.filter((item) => String(item.id) !== String(id));
    await saveResourcesState(updated, id);
    showToast("Resource deleted");
  };

  // News actions
  const openAddNews = () => {
    setEditingNews(null);
    setNewsModalOpen(true);
  };
  const openEditNews = (article) => {
    setEditingNews(article);
    setNewsModalOpen(true);
  };
  const handleDeleteNews = async (id) => {
    if (!window.confirm("Delete this news article? This action cannot be undone.")) return;
    const updated = news.filter((item) => String(item.id) !== String(id));
    await saveNewsState(updated, id);
    showToast("News article deleted");
  };

  const notesCount = resources.filter((item) => item.category === "Notes").length;
  const papersCount = resources.filter((item) => item.category === "Past Papers").length;
  const gkCount = resources.filter((item) => item.category === "General Knowledge").length;
  const newsCount = news.length;

  if (!isAuthenticated) {
    return (
      <div className="admin-body">
        <main>
          <section className="login-screen" id="loginScreen">
            <form className="login-card" id="loginForm" onSubmit={handleLoginSubmit}>
              <div className="login-brand-panel">
                <Link className="brand" to="/">
                  <img className="brand-logo" src="/assets/edu-family-logo.jpeg" alt="EDU FAMILY logo" />
                  <span>EDU FAMILY</span>
                </Link>
                <div>
                  <span className="eyebrow">Admin area</span>
                  <h1>Manage learning content.</h1>
                  <p>Update resources, news, and academic materials from a simple browser-based dashboard.</p>
                </div>
                <Link className="btn btn-light login-home-btn" to="/">
                  Back to Home
                </Link>
              </div>
              <div className="login-form-panel">
                <h2>Sign In</h2>
                <p className="form-help">Use the administrator email and password provided for EDU FAMILY.</p>
                
                <label htmlFor="username">Admin Email</label>
                <input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter Admin Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                  >
                    <svg viewBox="0 0 24 24">
                      {showLoginPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>

                <button className="btn btn-primary" id="loginSubmitBtn" type="submit" disabled={loginLoading}>
                  {loginLoading ? 'Signing In...' : 'Sign In'}
                </button>

                {authMessage.text && (
                  <p
                    className={`auth-message ${authMessage.isSuccess ? 'success' : ''}`}
                    id="authMessage"
                    role="status"
                    aria-live="polite"
                  >
                    {authMessage.text}
                  </p>
                )}
              </div>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-body">
      <main>
        <section className="admin-shell" id="adminShell">
          <aside className={`admin-sidebar ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Admin dashboard navigation">
            <div className="admin-sidebar-head">
              <Link className="brand" to="/">
                <img className="brand-logo" src="/assets/edu-family-logo.jpeg" alt="EDU FAMILY logo" />
                <span>EDU FAMILY</span>
              </Link>
              <button
                className="admin-mobile-toggle"
                id="adminMobileToggle"
                type="button"
                aria-label={mobileMenuOpen ? "Close admin menu" : "Open admin menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
            <nav id="adminNav" aria-label="Admin navigation">
              <button
                className={`admin-tab ${activeTab === 'resources' ? 'active' : ''}`}
                type="button"
                onClick={() => { setActiveTab('resources'); setMobileMenuOpen(false); }}
              >
                Resources
              </button>
              <button
                className={`admin-tab ${activeTab === 'news' ? 'active' : ''}`}
                type="button"
                onClick={() => { setActiveTab('news'); setMobileMenuOpen(false); }}
              >
                News Articles
              </button>
              <button
                className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`}
                type="button"
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              >
                Profile
              </button>
            </nav>
            <div className="admin-sidebar-footer">
              <Link to="/" className="admin-sidebar-link">
                View Website
              </Link>
              <button className="btn logout-sidebar-btn" id="logoutBtn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </aside>

          <div className="admin-main">
            <header className="admin-topbar">
              <div>
                <h2>Dashboard</h2>
                <p className="live-clock" aria-live="polite">
                  {clockText || 'Loading current time...'}
                </p>
                <p className="form-help">Content changes are stored locally and synced with Supabase.</p>
              </div>
            </header>

            <section className="admin-stats" aria-label="Dashboard analytics">
              <article className="stat-card">
                <span>{notesCount}</span>
                <p>Total Notes</p>
              </article>
              <article className="stat-card">
                <span>{papersCount}</span>
                <p>Total Past Papers</p>
              </article>
              <article className="stat-card">
                <span>{gkCount}</span>
                <p>Total GK Items</p>
              </article>
              <article className="stat-card">
                <span>{newsCount}</span>
                <p>Total News Posts</p>
              </article>
            </section>

            {activeTab === 'resources' && (
              <section className="admin-panel" id="resourcesPanel">
                <div className="admin-panel-head">
                  <div>
                    <h2>Manage Resources</h2>
                    <p>Add, edit, or delete notes, past papers, and GK content.</p>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={openAddResource}>
                    Add Resource
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.length > 0 ? (
                        resources.map((item) => (
                          <tr key={item.id}>
                            <td data-label="Resource">
                              <strong>{item.title}</strong>
                              <br />
                              <span>{item.description}</span>
                              <br />
                              <span className="file-label">{item.fileName || "Published PDF link"}</span>
                            </td>
                            <td data-label="Category">{item.category}</td>
                            <td data-label="Date">{formatDate(item.date)}</td>
                            <td data-label="Actions">
                              <div className="table-actions">
                                <button className="small-btn edit" type="button" onClick={() => openEditResource(item)}>
                                  Edit
                                </button>
                                <button className="small-btn delete" type="button" onClick={() => handleDeleteResource(item.id)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4">No resources available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'news' && (
              <section className="admin-panel" id="newsPanel">
                <div className="admin-panel-head">
                  <div>
                    <h2>Manage News</h2>
                    <p>Publish and update education news articles.</p>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={openAddNews}>
                    Add News
                  </button>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Headline</th>
                        <th>Date</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.length > 0 ? (
                        news.map((item) => (
                          <tr key={item.id}>
                            <td data-label="Headline">
                              <strong>{item.title}</strong>
                              <br />
                              <span>{item.summary}</span>
                              <br />
                              <span className="file-label">{item.imageName || "No image uploaded"}</span>
                            </td>
                            <td data-label="Date">{formatDate(item.date)}</td>
                            <td data-label="Featured">{item.featured ? "Featured" : "Standard"}</td>
                            <td data-label="Actions">
                              <div className="table-actions">
                                <button className="small-btn edit" type="button" onClick={() => openEditNews(item)}>
                                  Edit
                                </button>
                                <button className="small-btn delete" type="button" onClick={() => handleDeleteNews(item.id)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4">No news posts available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'profile' && (
              <section className="admin-panel" id="profilePanel">
                <div className="admin-panel-head">
                  <div>
                    <h2>Profile Settings</h2>
                    <p>Change your admin dashboard password.</p>
                  </div>
                </div>
                <div className="profile-card">
                  <div className="profile-brand-side">
                    <img className="profile-brand-logo" src="/assets/edu-family-logo.jpeg" alt="EDU FAMILY logo" />
                    <span className="profile-brand-name">EDU FAMILY</span>
                    <p className="profile-brand-desc">Admin Dashboard</p>
                    <div className="profile-info">
                      <p className="profile-email">{session?.user?.email || 'Admin User'}</p>
                      <p className="form-help">Signed in as administrator</p>
                    </div>
                  </div>
                  <div className="profile-form-side">
                    <h3>Change Password</h3>
                    <form className="settings-form" onSubmit={handlePasswordSubmit}>
                      <label htmlFor="currentPassword">Current Password</label>
                      <div className="password-wrapper">
                        <input
                          id="currentPassword"
                          type={showCurrentPw ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          className="password-toggle"
                          type="button"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowCurrentPw((prev) => !prev)}
                        >
                          <svg viewBox="0 0 24 24">
                            {showCurrentPw ? (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>

                      <label htmlFor="newPassword">New Password</label>
                      <div className="password-wrapper">
                        <input
                          id="newPassword"
                          type={showNewPw ? "text" : "password"}
                          autoComplete="new-password"
                          minLength="6"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          className="password-toggle"
                          type="button"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowNewPw((prev) => !prev)}
                        >
                          <svg viewBox="0 0 24 24">
                            {showNewPw ? (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>

                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <div className="password-wrapper">
                        <input
                          id="confirmPassword"
                          type={showConfirmPw ? "text" : "password"}
                          autoComplete="new-password"
                          minLength="6"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          className="password-toggle"
                          type="button"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowConfirmPw((prev) => !prev)}
                        >
                          <svg viewBox="0 0 24 24">
                            {showConfirmPw ? (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </>
                            ) : (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                      <p className="form-help">Password must be at least 6 characters.</p>

                      <button className="btn btn-primary" id="passwordSubmitBtn" type="submit" disabled={profileLoading}>
                        {profileLoading ? 'Updating...' : 'Update Password'}
                      </button>

                      {profileMessage.text && (
                        <p
                          className={`auth-message ${profileMessage.isSuccess ? 'success' : ''}`}
                          id="passwordMessage"
                          role="status"
                          aria-live="polite"
                        >
                          {profileMessage.text}
                        </p>
                      )}
                    </form>
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <ResourceModal
        resource={editingResource}
        isOpen={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
      />

      <AdminNewsModal
        article={editingNews}
        isOpen={newsModalOpen}
        onClose={() => setNewsModalOpen(false)}
      />
    </div>
  );
}
