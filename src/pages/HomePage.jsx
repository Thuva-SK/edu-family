import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ResourceCard from '../components/ResourceCard';

export default function HomePage() {
  const { resources, news } = useData();

  const latestResources = [...resources]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const notesCount = resources.filter((item) => item.category === "Notes").length;
  const papersCount = resources.filter((item) => item.category === "Past Papers").length;
  const gkCount = resources.filter((item) => item.category === "General Knowledge").length;
  const newsCount = news.length;

  return (
    <main>
      <section className="hero section-pad">
        <div className="container hero-layout reveal visible">
          <div className="hero-content">
            <span className="eyebrow">EDU FAMILY</span>
            <h1>Free education resources for focused learners.</h1>
            <p>
              Access notes, past papers, general knowledge content, and education news from one organized platform built
              for quick study and exam preparation.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/notes">
                Explore Resources
              </Link>
              <Link className="btn btn-secondary" to="/news">
                Latest News
              </Link>
            </div>
          </div>

          <div className="hero-preview" aria-label="EDU FAMILY resource highlights">
            <div className="hero-preview-brand">
              <img src="/assets/edu-family-logo.jpeg" alt="EDU FAMILY logo" />
              <div>
                <strong>EDU FAMILY</strong>
                <span>Free Education Platform</span>
              </div>
            </div>
            <div className="hero-preview-list">
              <div>
                <span>01</span>
                <strong>Past Papers</strong>
                <p>Exam-ready practice materials</p>
              </div>
              <div>
                <span>02</span>
                <strong>Study Notes</strong>
                <p>Organized learning resources</p>
              </div>
              <div>
                <span>03</span>
                <strong>Education News</strong>
                <p>Latest academic updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad soft-band">
        <div className="container">
          <div className="section-heading reveal visible">
            <span className="eyebrow">Freshly added</span>
            <h2>Featured Latest Resources</h2>
            <p>Recently uploaded learning materials and important updates stay visible so learners can move quickly.</p>
          </div>
          <div className="resource-grid" id="featuredResources" aria-live="polite">
            {latestResources.length > 0 ? (
              latestResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="empty-state">No resources uploaded yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container stats-grid reveal visible" id="statsGrid">
          <article className="stat-card">
            <span>{notesCount}</span>
            <p>Total Notes</p>
          </article>
          <article className="stat-card">
            <span>{papersCount}</span>
            <p>Past Papers</p>
          </article>
          <article className="stat-card">
            <span>{gkCount}</span>
            <p>GK Resources</p>
          </article>
          <article className="stat-card">
            <span>{newsCount}</span>
            <p>News Posts</p>
          </article>
        </div>
      </section>

      <section className="section-pad cta-band">
        <div className="container cta-inner reveal visible">
          <div>
            <h2>Build confident learners with organized academic content.</h2>
            <p>Keep notes, papers, GK resources, and announcements current with a fast, organized learning platform.</p>
          </div>
          <Link className="btn btn-light" to="/notes">
            Browse Resources
          </Link>
        </div>
      </section>
    </main>
  );
}
