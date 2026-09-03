import React from 'react';

export default function AboutPage() {
  return (
    <main>
      <section className="page-hero section-pad">
        <div className="container reveal visible">
          <span className="eyebrow">About the platform</span>
          <h1>Helping learners access the right resource at the right time.</h1>
          <p>
            EDU FAMILY is a premium educational resource and news platform designed for students, teachers, tuition
            centers, and academic organizations.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container split-grid">
          <article className="info-panel reveal visible">
            <h2>Our Mission</h2>
            <p>
              To simplify academic preparation by providing organized, searchable, and timely educational resources in
              one trusted destination.
            </p>
          </article>
          <article className="info-panel reveal visible">
            <h2>Our Vision</h2>
            <p>
              To become a leading digital learning support platform where every learner can discover clear resources and
              current academic updates.
            </p>
          </article>
        </div>
      </section>

      <section className="section-pad soft-band">
        <div className="container">
          <div className="section-heading reveal visible">
            <span className="eyebrow">What we offer</span>
            <h2>Services and Features</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card reveal visible">
              <span>01</span>
              <h3>Curated Notes</h3>
              <p>Cleanly categorized subject notes for revision and classroom support.</p>
            </article>
            <article className="feature-card reveal visible">
              <span>02</span>
              <h3>Exam Papers</h3>
              <p>Past papers organized by category and upload date for quick access.</p>
            </article>
            <article className="feature-card reveal visible">
              <span>03</span>
              <h3>Education News</h3>
              <p>Timely academic updates with featured stories and searchable archives.</p>
            </article>
            <article className="feature-card reveal visible">
              <span>04</span>
              <h3>Fresh Updates</h3>
              <p>Resources and news are kept current so learners always see the latest content.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="section-heading reveal visible">
            <span className="eyebrow">Why choose us</span>
            <h2>A polished platform for serious learning.</h2>
          </div>
          <div className="why-list reveal visible">
            <div>
              <strong>Fast Access</strong>
              <p>Search and filters make resources easy to find on any device.</p>
            </div>
            <div>
              <strong>Current Content</strong>
              <p>New indicators and latest sections keep updates visible.</p>
            </div>
            <div>
              <strong>Client Ready</strong>
              <p>Professional design, SEO foundations, and persistent local data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad ads-band">
        <div className="container ads-promo reveal visible">
          <div className="ads-promo-content">
            <div className="eyebrow ads-eyebrow">Ads Promotion 2026</div>
            <h2>Promote your message to EDU FAMILY learners.</h2>
            <p>Advertise through EDU FAMILY WhatsApp groups and channel with a reach of 9000+ verified students.</p>
            <div className="ads-promo-tags">
              <span>WhatsApp Groups</span>
              <span>WhatsApp Channel</span>
              <span>Bulk Discounts</span>
            </div>
          </div>
          <div className="ads-promo-card charges-card">
            <div className="card-glow"></div>
            <h3>Pricing Plans</h3>
            <ul className="ads-price-checklist">
              <li>
                <span>1 Ad post</span>
                <strong>Rs. 500</strong>
              </li>
              <li>
                <span>2 Ad posts</span>
                <strong>Rs. 1000</strong>
              </li>
              <li>
                <span>3 Ad posts</span>
                <strong>Rs. 1500</strong>
              </li>
              <li>
                <span>5 Ad posts</span>
                <strong>Rs. 2000</strong>
              </li>
              <li>
                <span>10 Ad posts</span>
                <strong>Rs. 3500</strong>
              </li>
            </ul>
          </div>
          <div className="ads-promo-card payment-card">
            <div className="card-glow"></div>
            <h3>Payment Details</h3>
            <div className="payment-info-grid">
              <div className="pay-item">
                <strong>Bank</strong>
                <span>NSB BANK</span>
              </div>
              <div className="pay-item">
                <strong>Name</strong>
                <span>B. Dhilakshan</span>
              </div>
              <div className="pay-item">
                <strong>Account</strong>
                <span>300073684262</span>
              </div>
            </div>
            <a
              className="btn btn-primary ads-cta"
              href="https://whatsapp.com/channel/0029VafVyoB2ZjCuGohiJe2V"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad contact-band">
        <div className="container contact-grid reveal visible">
          <div>
            <span className="eyebrow">Contact</span>
            <h2>Start a conversation about better learning access.</h2>
          </div>
          <div className="contact-card contact-details">
            <p>
              <strong>Email</strong>
              <a href="mailto:edufamily071@gmail.com">edufamily071@gmail.com</a>
            </p>
            <p>
              <strong>Website</strong>
              <a href="https://edufamily.vercel.app">edufamily.vercel.app</a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
