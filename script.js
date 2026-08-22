(function () {
  "use strict";

  const RESOURCE_KEY = "eduFamily.resources";
  const NEWS_KEY = "eduFamily.news";
  const STORAGE_EVENT = "eduFamily.updated";
  const DB_NAME = "eduFamilyFiles";
  const DB_STORE = "files";
  const LEGACY_DOMAIN = "https://edufamiy.vercel.app";
  const SUPABASE_URL = "https://qlenbutdedkxscwrlniu.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZW5idXRkZWRreHNjd3Jsbml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTg2ODcsImV4cCI6MjA5NDQ5NDY4N30.t9ThaW86Gls4EZalj2E6d8pIqsRHGFeTCmjAvviMlwI";

  const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  let lastSeenUpdate = localStorage.getItem(STORAGE_EVENT) || "";
  let notesControlsBound = false;
  let newsControlsBound = false;
  let isUsingSupabase = !!supabaseClient;

  const componentFallbacks = {
    nav: `
      <header class="site-header">
        <nav class="navbar container" aria-label="Primary navigation">
          <a class="brand" href="index.html" aria-label="EDU FAMILY home">
            <img class="brand-logo" src="assets/edu-family-logo.jpeg" alt="EDU FAMILY logo">
            <span>EDU FAMILY</span>
          </a>
          <div class="nav-actions">
            <button class="theme-toggle" type="button" aria-label="Toggle dark mode" title="Toggle dark mode">
              <span class="icon-sun">☀️</span>
              <span class="icon-moon">🌙</span>
            </button>
            <button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
          <div class="nav-menu">
            <a href="index.html">Home</a>
            <a href="notes.html">Notes</a>
            <a href="news.html">News</a>
            <a href="about.html">About</a>
          </div>
        </nav>
      </header>
    `,
    footer: `
      <footer class="site-footer">
        <div class="container footer-modern">
          <div class="footer-main">
            <a class="brand footer-brand" href="index.html">
              <img class="brand-logo" src="assets/edu-family-logo.jpeg" alt="EDU FAMILY logo">
              <span>EDU FAMILY</span>
            </a>
            <p>Free education resources, academic news, notes, past papers, and GK content for focused learners.</p>
          </div>
          <nav class="footer-nav" aria-label="Footer navigation">
            <a href="index.html">Home</a>
            <a href="notes.html">Notes</a>
            <a href="news.html">News</a>
            <a href="about.html">About</a>
          </nav>
          <div class="footer-contact">
            <a href="mailto:edufamily071@gmail.com" class="footer-email">edufamily071@gmail.com</a>
            <a class="footer-channel" href="https://youtube.com/@edufamilyintamil?si=RqAfdf7gd4tE-47k" target="_blank" rel="noopener noreferrer">
              <svg class="footer-channel-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C16 4 12 4 12 4s-4 0-6.8.2c-.4.1-1.3.1-2 .9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.9v1.7c0 1.9.2 3.7.2 3.7s.2 1.5.8 2.1c.8.8 1.8.8 2.2.9 1.6.2 6.6.2 6.6.2s4 0 6.8-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.9.2-3.7v-1.7c0-1.9-.2-3.7-.2-3.7ZM10.1 14.7V8.3l5.2 3.2-5.2 3.2Z" />
              </svg>
              <span class="footer-channel-text">YouTube Channel</span>
            </a>
            <a class="footer-channel footer-whatsapp" href="https://whatsapp.com/channel/0029VafVyoB2ZjCuGohiJe2V" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Channel">
              <svg class="footer-channel-icon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.1 4.9A9.9 9.9 0 0 0 3.5 16.8L2 22l5.3-1.4A9.9 9.9 0 0 0 22 12a9.8 9.8 0 0 0-2.9-7.1Zm-7.1 15a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.4.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.3-.2-.5-.3Z" />
              </svg>
              <span class="footer-channel-text">WhatsApp Channel</span>
            </a>
          </div>
        </div>
        <div class="container footer-bottom"><p>© 2026 EDU FAMILY. All rights reserved.</p></div>
      </footer>
    `
  };

  const today = new Date();
  const isoToday = today.toISOString().slice(0, 10);

  const starterResources = [
    { id: "res-1", title: "2025 Mathematics Model Paper", category: "Past Papers", description: "Complete model paper with structured questions for exam revision.", date: isoOffset(-1), link: "https://edufamily.vercel.app/resources/math-model-paper.pdf" },
    { id: "res-2", title: "Science Short Notes: Energy", category: "Notes", description: "Concise theory notes covering energy forms, transfer, and applications.", date: isoOffset(-3), link: "https://edufamily.vercel.app/resources/science-energy-notes.pdf" },
    { id: "res-3", title: "World Capitals Quick GK Set", category: "General Knowledge", description: "A quick reference guide for capitals, regions, and key facts.", date: isoOffset(-8), link: "https://edufamily.vercel.app/resources/world-capitals-gk.pdf" },
    { id: "res-4", title: "English Literature Past Paper", category: "Past Papers", description: "Practice paper with essay prompts and comprehension questions.", date: isoOffset(-15), link: "https://edufamily.vercel.app/resources/english-literature-paper.pdf" },
    { id: "res-5", title: "ICT Revision Notes: Databases", category: "Notes", description: "Student-friendly database concepts, diagrams, and revision checkpoints.", date: isoOffset(-2), link: "https://edufamily.vercel.app/resources/ict-database-notes.pdf" },
    { id: "res-6", title: "Current Affairs GK Digest", category: "General Knowledge", description: "Monthly current affairs summary for interviews and scholarship exams.", date: isoOffset(-5), link: "https://edufamily.vercel.app/resources/current-affairs-gk.pdf" }
  ];

  const starterNews = [
    { id: "news-1", title: "New Exam Preparation Calendar Released", summary: "The updated preparation calendar gives students a clearer path for weekly revision.", body: "EDU FAMILY has published a structured preparation calendar to help learners organize revision, mock tests, and subject reviews. The calendar is designed for flexible use across grades and subjects.", date: isoOffset(-1), featured: true },
    { id: "news-2", title: "Scholarship Application Window Opens", summary: "Students can now prepare documents for the latest merit-based scholarship intake.", body: "The scholarship application period is open for eligible learners. Applicants should prepare academic records, identity documents, and recommendation letters before submitting their applications.", date: isoOffset(-4), featured: false },
    { id: "news-3", title: "Digital Learning Workshop Announced", summary: "A new workshop will focus on study planning, note-taking, and online learning tools.", body: "Educators and students are invited to attend a practical digital learning workshop covering productive study methods and reliable online resource usage.", date: isoOffset(-7), featured: false }
  ];

  function isoOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function seedData() {
    if (!localStorage.getItem(RESOURCE_KEY)) {
      localStorage.setItem(RESOURCE_KEY, JSON.stringify(starterResources));
    } else {
      migrateStoredResourceDomains();
    }
    if (!localStorage.getItem(NEWS_KEY)) {
      localStorage.setItem(NEWS_KEY, JSON.stringify(starterNews));
    }
  }

  function migrateStoredResourceDomains() {
    const resources = getResources();
    let changed = false;
    const migrated = resources.map((resource) => {
      if (!resource.link || !resource.link.includes(LEGACY_DOMAIN)) return resource;
      changed = true;
      return { ...resource, link: resource.link.replace(LEGACY_DOMAIN, "https://edufamily.vercel.app") };
    });
    if (changed) localStorage.setItem(RESOURCE_KEY, JSON.stringify(migrated));
  }

  function getResources() {
    return JSON.parse(localStorage.getItem(RESOURCE_KEY) || "[]");
  }

  function getNews() {
    return JSON.parse(localStorage.getItem(NEWS_KEY) || "[]");
  }

  async function syncFromSupabase() {
    if (!supabaseClient) return;
    try {
      const { data: resources } = await supabaseClient.from("resources").select("*").order("created_at", { ascending: false });
      const { data: news } = await supabaseClient.from("news").select("*").order("created_at", { ascending: false });

      if (resources) {
        localStorage.setItem(RESOURCE_KEY, JSON.stringify(resources));
      }
      if (news) {
        localStorage.setItem(NEWS_KEY, JSON.stringify(news));
      }

      if (resources || news) {
        refreshPageViews();
      }
    } catch (err) {
      console.warn("Supabase Sync Error:", err);
    }
  }

  async function saveResources(resources, deletedId = null) {
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(resources));
    notifyUpdate();

    if (supabaseClient) {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        if (deletedId) {
          await supabaseClient.from("resources").delete().eq("id", deletedId);
        } else {
          await supabaseClient.from("resources").upsert(resources);
        }
      }
    }
  }

  async function saveNews(news, deletedId = null) {
    localStorage.setItem(NEWS_KEY, JSON.stringify(news));
    notifyUpdate();

    if (supabaseClient) {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        if (deletedId) {
          await supabaseClient.from("news").delete().eq("id", deletedId);
        } else {
          await supabaseClient.from("news").upsert(news);
        }
      }
    }
  }

  function openFileDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveFile(fileId, file) {
    const db = await openFileDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(file, fileId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getFile(fileId) {
    const db = await openFileDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const request = tx.objectStore(DB_STORE).get(fileId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function getFileUrl(fileId) {
    const file = await getFile(fileId);
    return file ? URL.createObjectURL(file) : "";
  }

  function notifyUpdate() {
    localStorage.setItem(STORAGE_EVENT, String(Date.now()));
    lastSeenUpdate = localStorage.getItem(STORAGE_EVENT) || "";
    window.dispatchEvent(new Event("eduFamilyRefresh"));
  }

  function isNew(dateString) {
    const uploaded = new Date(dateString);
    const diff = (Date.now() - uploaded.getTime()) / 86400000;
    return diff <= 7;
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(dateString));
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initThemeToggle() {
    const THEME_KEY = "eduFamily.theme";
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initial);

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-toggle");
      if (!btn) return;
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  function loadComponentSync(name) {
    if (location.protocol === "file:") return componentFallbacks[name] || "";
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${name}.html`, false);
      xhr.send();
      if (xhr.status === 0 || xhr.status === 200) return xhr.responseText;
    } catch (e) { /* ignore */ }
    return componentFallbacks[name] || "";
  }

  async function loadComponents() {
    const components = document.querySelectorAll("[data-component]");
    if (!components.length) return;
    [...components].forEach((slot) => {
      const name = slot.dataset.component;
      slot.innerHTML = loadComponentSync(name);
    });
    setActiveNavLink();
  }

  function setActiveNavLink() {
    const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav-menu a, .footer-nav a").forEach((link) => {
      const linkPage = link.getAttribute("href").toLowerCase();
      link.classList.toggle("active", linkPage === currentPage);
    });
  }

  function initClock() {
    const clocks = document.querySelectorAll(".live-clock");
    if (!clocks.length) return;
    const render = () => {
      const text = new Intl.DateTimeFormat("en", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(new Date());
      clocks.forEach((clock) => { clock.textContent = text; });
    };
    render();
    setInterval(render, 1000);
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  function resourceCard(resource) {
    const shortCategory = resource.category === "General Knowledge" ? "GK" : resource.category.split(" ").map((word) => word[0]).join("");
    const downloadUrl = resource.fileData || resource.link || "#";
    const downloadName = resource.fileName || `${resource.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    const fileAttribute = resource.fileId ? ` data-download-resource="${escapeAttribute(resource.fileId)}"` : "";
    return `
      <article class="resource-card">
        <div class="resource-icon" aria-hidden="true">${shortCategory}</div>
        <div class="meta-row">
          <span class="category-pill">${resource.category}</span>
          ${isNew(resource.date) ? '<span class="badge">New</span>' : ""}
        </div>
        <h3>${escapeHtml(resource.title)}</h3>
        <p>${escapeHtml(resource.description)}</p>
        <div class="meta-row"><span>Uploaded ${formatDate(resource.date)}</span></div>
        <a class="btn btn-secondary" href="${escapeAttribute(downloadUrl)}" download="${escapeAttribute(downloadName)}" target="_blank" rel="noopener"${fileAttribute}>Download PDF</a>
      </article>
    `;
  }

  function newsCard(article) {
    const imageMarkup = article.imageData
      ? `<img src="${escapeAttribute(article.imageData)}" alt="${escapeAttribute(article.title)} news image">`
      : article.imageFileId
        ? `<span data-news-image-id="${escapeAttribute(article.imageFileId)}" data-news-image-alt="${escapeAttribute(article.title)} news image">Loading image</span>`
        : "Education News";
    return `
      <article class="news-card">
        <div class="news-image"${article.imageData ? "" : ' aria-hidden="true"'}>${imageMarkup}</div>
        <div class="meta-row">
          <span>${formatDate(article.date)}</span>
          ${isNew(article.date) ? '<span class="badge">New</span>' : ""}
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.summary)}</p>
        <button class="btn btn-secondary" type="button" data-read-news="${article.id}">Read More</button>
      </article>
    `;
  }

  function renderHome() {
    const featured = document.getElementById("featuredResources");
    const resources = getResources();
    const news = getNews();
    const latestResources = [...resources].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    if (featured) featured.innerHTML = latestResources.map(resourceCard).join("");

    setText("statNotes", resources.filter((item) => item.category === "Notes").length);
    setText("statPapers", resources.filter((item) => item.category === "Past Papers").length);
    setText("statGk", resources.filter((item) => item.category === "General Knowledge").length);
    setText("statNews", news.length);
  }

  function renderNotes() {
    const search = document.getElementById("resourceSearch");
    const category = document.getElementById("categoryFilter");
    const sort = document.getElementById("sortResources");
    if (!search || !category || !sort) return;

    if (!notesControlsBound) {
      [search, category, sort].forEach((control) => control.addEventListener("input", renderNotes));
      notesControlsBound = true;
    }

    const term = search.value.trim().toLowerCase();
    const selected = category.value;
    const sorted = [...getResources()].sort((a, b) => sort.value === "latest" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    const filtered = sorted.filter((item) => {
      const matchesCategory = selected === "all" || item.category === selected;
      const haystack = `${item.title} ${item.category} ${item.description}`.toLowerCase();
      return matchesCategory && haystack.includes(term);
    });
    renderCategory("pastPapersGrid", filtered, "Past Papers", selected);
    renderCategory("notesGrid", filtered, "Notes", selected);
    renderCategory("gkGrid", filtered, "General Knowledge", selected);
  }

  function renderCategory(id, items, category, selectedCategory = "all") {
    const grid = document.getElementById(id);
    if (!grid) return;
    const section = grid.closest(".resource-section");
    const shouldShowSection = selectedCategory === "all" || selectedCategory === category;
    if (section) section.hidden = !shouldShowSection;
    if (!shouldShowSection) {
      grid.innerHTML = "";
      return;
    }
    const categoryItems = items.filter((item) => item.category === category);
    grid.innerHTML = categoryItems.length ? categoryItems.map(resourceCard).join("") : `<div class="empty-state">No ${category} resources found.</div>`;
  }

  function renderNews() {
    const grid = document.getElementById("newsGrid");
    const search = document.getElementById("newsSearch");
    const featured = document.getElementById("featuredNews");
    if (!grid || !search) return;

    if (!newsControlsBound) {
      search.addEventListener("input", renderNews);
      newsControlsBound = true;
    }

    const term = search.value.trim().toLowerCase();
    const news = [...getNews()].sort((a, b) => new Date(b.date) - new Date(a.date));
    const filtered = news.filter((item) => `${item.title} ${item.summary} ${item.body}`.toLowerCase().includes(term));
    const topStory = news.find((item) => item.featured) || news[0];
    if (featured && topStory) {
      const featuredImage = topStory.imageData
        ? `<img src="${escapeAttribute(topStory.imageData)}" alt="${escapeAttribute(topStory.title)} featured news image">`
        : topStory.imageFileId
          ? `<span data-news-image-id="${escapeAttribute(topStory.imageFileId)}" data-news-image-alt="${escapeAttribute(topStory.title)} featured news image">Loading image</span>`
          : "Top Story";
      featured.innerHTML = `
        <div class="news-image"${topStory.imageData ? "" : ' aria-hidden="true"'}>${featuredImage}</div>
        <div>
          <span class="eyebrow">Featured News</span>
          <h2>${escapeHtml(topStory.title)}</h2>
          <p>${escapeHtml(topStory.summary)}</p>
          <div class="meta-row"><span>${formatDate(topStory.date)}</span>${isNew(topStory.date) ? '<span class="badge">New</span>' : ""}</div>
          <button class="btn btn-primary" type="button" data-read-news="${topStory.id}">Read More</button>
        </div>
      `;
    } else if (featured) {
      featured.innerHTML = "";
    }
    grid.innerHTML = filtered.length ? filtered.map(newsCard).join("") : '<div class="empty-state">No news articles found.</div>';
    hydrateNewsImages();
  }

  async function openNewsModal(id) {
    const article = getNews().find((item) => item.id === id);
    const modal = document.getElementById("newsModal");
    const content = document.getElementById("modalContent");
    if (!article || !modal || !content) return;
    const imageUrl = article.imageData || (article.imageFileId ? await getFileUrl(article.imageFileId) : "");
    const modalImage = imageUrl ? `<div class="news-image modal-news-image"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(article.title)} news image"></div>` : "";
    content.innerHTML = `
      <span class="eyebrow">Education News</span>
      <h2 id="modalTitle">${escapeHtml(article.title)}</h2>
      ${modalImage}
      <div class="meta-row"><span>${formatDate(article.date)}</span></div>
      <p>${escapeHtml(article.body)}</p>
    `;
    openModal(modal);
  }

  async function hydrateNewsImages() {
    const imageSlots = document.querySelectorAll("[data-news-image-id]");
    for (const imageSlot of imageSlots) {
      const url = await getFileUrl(imageSlot.dataset.newsImageId);
      if (!url) continue;
      const img = document.createElement("img");
      img.src = url;
      img.alt = imageSlot.dataset.newsImageAlt || "News image";
      imageSlot.replaceWith(img);
    }
  }

  async function handleResourceDownload(event) {
    const link = event.target.closest("[data-download-resource]");
    if (!link) return;
    event.preventDefault();
    const file = await getFile(link.dataset.downloadResource);
    if (!file) {
      showToast("PDF file was not found in this browser");
      return;
    }
    const url = URL.createObjectURL(file);
    const download = document.createElement("a");
    download.href = url;
    download.download = link.getAttribute("download") || file.name || "resource.pdf";
    document.body.appendChild(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleNewsReadClick(event) {
    const button = event.target.closest("[data-read-news]");
    if (!button) return;
    openNewsModal(button.dataset.readNews);
  }

  function openModal(modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function initModals() {
    document.addEventListener("click", (event) => {
      if (event.target.matches("[data-close-modal]")) closeModal(event.target.closest(".modal"));
      if (event.target.classList.contains("modal")) closeModal(event.target);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") document.querySelectorAll(".modal.open").forEach(closeModal);
    });
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function refreshPageViews() {
    renderHome();
    renderNotes();
    renderNews();
  }

  function handleStorageRefresh(event) {
    if (!event || [RESOURCE_KEY, NEWS_KEY, STORAGE_EVENT].includes(event.key)) {
      lastSeenUpdate = localStorage.getItem(STORAGE_EVENT) || "";
      refreshPageViews();
    }
  }

  function startRealtimeWatcher() {
    if (supabaseClient) {
      supabaseClient
        .channel("public-db-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, syncFromSupabase)
        .on("postgres_changes", { event: "*", schema: "public", table: "news" }, syncFromSupabase)
        .subscribe();
    }

    setInterval(() => {
      const currentUpdate = localStorage.getItem(STORAGE_EVENT) || "";
      if (currentUpdate && currentUpdate !== lastSeenUpdate) {
        lastSeenUpdate = currentUpdate;
        refreshPageViews();
      }
    }, 2000);
  }

  window.EduFamilyStore = {
    RESOURCE_KEY,
    NEWS_KEY,
    getResources,
    getNews,
    saveResources,
    saveNews,
    isNew,
    formatDate,
    showToast,
    openModal,
    closeModal,
    saveFile,
    getFile,
    getFileUrl,
    notifyUpdate
  };

  seedData();
  document.addEventListener("DOMContentLoaded", async () => {
    await loadComponents();
    initNavigation();
    initThemeToggle();
    initClock();
    initReveal();
    initModals();
    refreshPageViews();
    startRealtimeWatcher();
    document.addEventListener("click", handleResourceDownload);
    document.addEventListener("click", handleNewsReadClick);
  });
  window.addEventListener("storage", handleStorageRefresh);
  window.addEventListener("eduFamilyRefresh", refreshPageViews);
})();
