import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-modern">
        <div className="footer-main">
          <Link className="brand footer-brand" to="/">
            <img className="brand-logo" src="/assets/edu-family-logo.jpeg" alt="EDU FAMILY logo" />
            <span>EDU FAMILY</span>
          </Link>
          <p>Free education resources, academic news, notes, past papers, and GK content for focused learners.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/notes">Notes</Link>
          <Link to="/news">News</Link>
          <Link to="/about">About</Link>
        </nav>
        <div className="footer-contact">
          <a href="mailto:edufamily071@gmail.com" className="footer-email">
            edufamily071@gmail.com
          </a>
          <a
            className="footer-channel"
            href="https://youtube.com/@edufamilyintamil?si=RqAfdf7gd4tE-47k"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="footer-channel-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C16 4 12 4 12 4s-4 0-6.8.2c-.4.1-1.3.1-2 .9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.9v1.7c0 1.9.2 3.7.2 3.7s.2 1.5.8 2.1c.8.8 1.8.8 2.2.9 1.6.2 6.6.2 6.6.2s4 0 6.8-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.9.2-3.7v-1.7c0-1.9-.2-3.7-.2-3.7ZM10.1 14.7V8.3l5.2 3.2-5.2 3.2Z" />
            </svg>
            <span className="footer-channel-text">YouTube Channel</span>
          </a>
          <a
            className="footer-channel footer-whatsapp"
            href="https://whatsapp.com/channel/0029VafVyoB2ZjCuGohiJe2V"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Channel"
          >
            <svg className="footer-channel-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19.1 4.9A9.9 9.9 0 0 0 3.5 16.8L2 22l5.3-1.4A9.9 9.9 0 0 0 22 12a9.8 9.8 0 0 0-2.9-7.1Zm-7.1 15a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.4.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.3-.2-.5-.3Z" />
            </svg>
            <span className="footer-channel-text">WhatsApp Channel</span>
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 EDU FAMILY. All rights reserved.</p>
      </div>
    </footer>
  );
}
