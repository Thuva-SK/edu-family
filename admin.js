(function () {
  "use strict";

  const SUPABASE_URL = "https://qlenbutdedkxscwrlniu.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZW5idXRkZWRreHNjd3Jsbml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTg2ODcsImV4cCI6MjA5NDQ5NDY4N30.t9ThaW86Gls4EZalj2E6d8pIqsRHGFeTCmjAvviMlwI";
  const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }) : null;
  const loginScreen = document.getElementById("loginScreen");
  const adminShell = document.getElementById("adminShell");
  const loginForm = document.getElementById("loginForm");
  const loginSubmitBtn = document.getElementById("loginSubmitBtn");
  const authMessage = document.getElementById("authMessage");
  const adminSidebar = document.querySelector(".admin-sidebar");
  const adminMobileToggle = document.getElementById("adminMobileToggle");
  const logoutBtn = document.getElementById("logoutBtn");
  const resourcesPanel = document.getElementById("resourcesPanel");
  const newsPanel = document.getElementById("newsPanel");
  const profilePanel = document.getElementById("profilePanel");
  const passwordForm = document.getElementById("passwordForm");
  const passwordSubmitBtn = document.getElementById("passwordSubmitBtn");
  const passwordMessage = document.getElementById("passwordMessage");
  const profileEmail = document.getElementById("profileEmail");
  const resourceModal = document.getElementById("resourceModal");
  const adminNewsModal = document.getElementById("adminNewsModal");
  const resourceForm = document.getElementById("resourceForm");
  const newsForm = document.getElementById("adminNewsForm");
  let loginAttempt = 0;

  async function isAuthed() {
    if (!supabaseClient) return false;
    const { data } = await supabaseClient.auth.getSession();
    return !!(data && data.session);
  }

  async function setAuthView() {
    const authed = await isAuthed();
    setAdminView(authed);
  }

  function setAdminView(authed) {
    loginScreen.hidden = authed;
    adminShell.hidden = !authed;
    if (authed) renderDashboard();
  }

  function setAuthMessage(message, type = "error") {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.classList.toggle("success", type === "success");
  }

  function setLoginLoading(isLoading) {
    if (!loginSubmitBtn) return;
    loginSubmitBtn.disabled = isLoading;
    loginSubmitBtn.textContent = isLoading ? "Signing In..." : "Sign In";
  }

  function withTimeout(promise, message = "Connection timed out. Check internet or Supabase settings.") {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), 12000);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
  }

  const BUCKET_NAME = "resources";

  async function signInWithSupabase(email, password) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { data: null, error: { message: payload.error_description || payload.msg || payload.message || "Invalid email or password" } };
      }
      return { data: { session: payload }, error: null };
    } catch (error) {
      if (error.name === "AbortError") {
        return { data: null, error: { message: "Connection timed out. Supabase is not responding from this network." } };
      }
      return { data: null, error: { message: error.message || "Could not connect to Supabase." } };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function renderDashboard() {
    const resources = EduFamilyStore.getResources();
    const news = EduFamilyStore.getNews();
    setText("adminNotesCount", resources.filter((item) => item.category === "Notes").length);
    setText("adminPapersCount", resources.filter((item) => item.category === "Past Papers").length);
    setText("adminGkCount", resources.filter((item) => item.category === "General Knowledge").length);
    setText("adminNewsCount", news.length);
    renderResourceTable(resources);
    renderNewsTable(news);
  }

  function renderResourceTable(resources) {
    const table = document.getElementById("adminResourcesTable");
    table.innerHTML = resources.length ? resources.map((item) => `
      <tr>
        <td data-label="Resource"><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.description)}</span><br><span class="file-label">${escapeHtml(item.fileName || "Published PDF link")}</span></td>
        <td data-label="Category">${escapeHtml(item.category)}</td>
        <td data-label="Date">${EduFamilyStore.formatDate(item.date)}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="small-btn edit" type="button" data-edit-resource="${item.id}">Edit</button>
            <button class="small-btn delete" type="button" data-delete-resource="${item.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("") : '<tr><td colspan="4">No resources available.</td></tr>';
  }

  function renderNewsTable(news) {
    const table = document.getElementById("adminNewsTable");
    table.innerHTML = news.length ? news.map((item) => `
      <tr>
        <td data-label="Headline"><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.summary)}</span><br><span class="file-label">${escapeHtml(item.imageName || "No image uploaded")}</span></td>
        <td data-label="Date">${EduFamilyStore.formatDate(item.date)}</td>
        <td data-label="Featured">${item.featured ? "Featured" : "Standard"}</td>
        <td data-label="Actions">
          <div class="table-actions">
            <button class="small-btn edit" type="button" data-edit-news="${item.id}">Edit</button>
            <button class="small-btn delete" type="button" data-delete-news="${item.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("") : '<tr><td colspan="4">No news posts available.</td></tr>';
  }

  function bindAuth() {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setAuthMessage("");
      if (!supabaseClient) {
        setAuthMessage("Supabase could not load. Check your internet connection.");
        return;
      }
      const usernameInput = document.getElementById("username");
      const username = usernameInput.value.trim().toLowerCase();
      const password = document.getElementById("password").value.trim();

      const attemptId = loginAttempt + 1;
      loginAttempt = attemptId;
      setLoginLoading(true);
      setAuthMessage("Signing in...", "success");
      const safetyTimer = setTimeout(() => {
        if (loginAttempt !== attemptId) return;
        setLoginLoading(false);
        setAuthMessage("Still waiting for Supabase. Check project URL, anon key, internet, or browser console.");
      }, 15000);
      try {
        const { data, error } = await withTimeout(
          signInWithSupabase(username, password),
          "Connection timed out. Supabase did not answer the login request."
        );
        if (loginAttempt !== attemptId) return;
        if (error) {
          const message = error.message || "Invalid email or password";
          setAuthMessage(message);
          EduFamilyStore.showToast(message);
          return;
        }
        if (!data.session) {
          setAuthMessage("Login was accepted, but no session was created. Check Supabase Auth settings.");
          return;
        }
        setAuthMessage("Login successful", "success");
        EduFamilyStore.showToast("Login successful");
        supabaseClient.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }).catch(() => { });
        setAdminView(true);
      } catch (error) {
        if (loginAttempt !== attemptId) return;
        const message = error.message || "Could not connect to Supabase. Check internet or project settings.";
        setAuthMessage(message);
        EduFamilyStore.showToast(message);
      } finally {
        clearTimeout(safetyTimer);
        if (loginAttempt === attemptId) setLoginLoading(false);
      }
    });
  }

  function bindLogout() {
    if (!logoutBtn) {
      console.warn("Logout button not found in DOM");
      return;
    }
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        // 1. Actual logout call
        if (supabaseClient) {
          await supabaseClient.auth.signOut();
        }
        // 2. Clear view
        setAdminView(false);
        EduFamilyStore.showToast("Logged out successfully");
      } catch (err) {
        console.error("Logout Error:", err);
      } finally {
        // 3. Force redirect to ensure state is clean
        window.location.href = "admin.html";
      }
    });
  }

  function bindTabs() {
    document.querySelectorAll("[data-admin-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll("[data-admin-tab]").forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.adminTab;
        resourcesPanel.hidden = target !== "resources";
        newsPanel.hidden = target !== "news";
        profilePanel.hidden = target !== "profile";
        closeAdminMobileMenu();
      });
    });
  }

  function bindAdminMobileMenu() {
    if (!adminSidebar || !adminMobileToggle) return;
    adminMobileToggle.addEventListener("click", () => {
      const isOpen = adminSidebar.classList.toggle("nav-open");
      adminMobileToggle.setAttribute("aria-expanded", String(isOpen));
      adminMobileToggle.setAttribute("aria-label", isOpen ? "Close admin menu" : "Open admin menu");
    });
  }

  function closeAdminMobileMenu() {
    if (!adminSidebar || !adminMobileToggle) return;
    adminSidebar.classList.remove("nav-open");
    adminMobileToggle.setAttribute("aria-expanded", "false");
    adminMobileToggle.setAttribute("aria-label", "Open admin menu");
  }



  function bindResourceManagement() {
    document.querySelector("[data-open-resource-modal]").addEventListener("click", () => {
      resourceForm.reset();
      document.getElementById("resourceId").value = "";
      document.getElementById("resourceDate").value = new Date().toISOString().slice(0, 10);
      document.getElementById("resourceFileHelp").textContent = "Choose a PDF file up to 30 MB. Existing PDFs stay attached when editing unless you upload a new one.";
      document.getElementById("resourceModalTitle").textContent = "Add Resource";
      EduFamilyStore.openModal(resourceModal);
    });

    resourceForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = document.getElementById("resourceId").value || `res-${Date.now()}`;
      const resources = EduFamilyStore.getResources();
      const index = resources.findIndex((item) => item.id === id);
      const existing = index >= 0 ? resources[index] : {};
      const fileInput = document.getElementById("resourceFile");
      const file = fileInput.files[0];

      if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        EduFamilyStore.showToast("Please upload a PDF file");
        return;
      }

      if (file && file.size > 30 * 1024 * 1024) {
        EduFamilyStore.showToast("PDF is too large. Please use a file under 30 MB.");
        return;
      }

      let fileData = existing.fileData || "";
      let fileName = existing.fileName || "";
      let fileId = existing.fileId || "";
      let link = existing.link || "https://edufamily.vercel.app/resources";

      if (file) {
        try {
          const storageId = `resource-${id}-${Date.now()}`;
          const filePath = `pdfs/${storageId}.pdf`;
          const { error: uploadError } = await supabaseClient.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, { contentType: "application/pdf", upsert: true });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);
          link = urlData ? urlData.publicUrl : "";
          fileData = "";
          fileName = file.name;
          fileId = "";
        } catch (storageError) {
          console.warn("Supabase Storage upload failed, falling back to local storage:", storageError);
          try {
            fileId = `resource-${id}-${Date.now()}`;
            await EduFamilyStore.saveFile(fileId, file);
            fileData = "";
            fileName = file.name;
            link = "";
          } catch (localError) {
            EduFamilyStore.showToast("Could not save the PDF file");
            return;
          }
        }
      }

      const payload = {
        id,
        title: document.getElementById("resourceTitle").value.trim(),
        category: document.getElementById("resourceCategory").value,
        description: document.getElementById("resourceDescription").value.trim(),
        date: document.getElementById("resourceDate").value,
        link,
        fileData,
        fileName,
        fileId
      };
      if (index >= 0) resources[index] = payload;
      else resources.unshift(payload);
      try {
        EduFamilyStore.saveResources(resources);
      } catch (error) {
        const compactResources = compactInlineResourceFiles(resources);
        try {
          EduFamilyStore.saveResources(compactResources);
          EduFamilyStore.showToast("Resource saved. Old inline PDF data was cleared to free browser storage.");
        } catch (retryError) {
          EduFamilyStore.showToast("Could not save resource. Clear old browser site data and try again.");
          return;
        }
      }
      EduFamilyStore.closeModal(resourceModal);
      EduFamilyStore.showToast(index >= 0 ? "Resource updated" : "Resource added");
      renderDashboard();
    });
  }

  function bindNewsManagement() {
    document.querySelector("[data-open-news-modal]").addEventListener("click", () => {
      newsForm.reset();
      document.getElementById("newsId").value = "";
      document.getElementById("newsDate").value = new Date().toISOString().slice(0, 10);
      document.getElementById("newsImageHelp").textContent = "Choose a JPG, PNG, or WebP image up to 5 MB. Existing images stay attached when editing unless you upload a new one.";
      document.getElementById("newsModalTitle").textContent = "Add News Article";
      EduFamilyStore.openModal(adminNewsModal);
    });

    newsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const id = document.getElementById("newsId").value || `news-${Date.now()}`;
      const imageInput = document.getElementById("newsImage");
      const image = imageInput.files[0];
      let news = EduFamilyStore.getNews();
      const index = news.findIndex((item) => item.id === id);
      const existing = index >= 0 ? news[index] : {};
      let imageData = existing.imageData || "";
      let imageName = existing.imageName || "";
      let imageFileId = existing.imageFileId || "";

      if (image && !image.type.startsWith("image/")) {
        EduFamilyStore.showToast("Please upload an image file");
        return;
      }

      if (image && image.size > 5 * 1024 * 1024) {
        EduFamilyStore.showToast("Image is too large. Please use an image under 5 MB.");
        return;
      }

      if (image) {
        try {
          const storageId = `news-image-${id}-${Date.now()}`;
          const ext = image.name.split(".").pop() || "jpg";
          const filePath = `news/${storageId}.${ext}`;
          const { error: uploadError } = await supabaseClient.storage
            .from(BUCKET_NAME)
            .upload(filePath, image, { contentType: image.type, upsert: true });
          if (uploadError) throw uploadError;
          const { data: urlData } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);
          imageData = urlData ? urlData.publicUrl : "";
          imageName = image.name;
          imageFileId = "";
        } catch (storageError) {
          console.warn("Supabase Storage upload failed for image, falling back to local:", storageError);
          try {
            imageFileId = `news-image-${id}-${Date.now()}`;
            await EduFamilyStore.saveFile(imageFileId, image);
            imageData = "";
            imageName = image.name;
          } catch (localError) {
            EduFamilyStore.showToast("Could not save the image file");
            return;
          }
        }
      }

      const payload = {
        id,
        title: document.getElementById("newsTitle").value.trim(),
        summary: document.getElementById("newsSummary").value.trim(),
        body: document.getElementById("newsBody").value.trim(),
        date: document.getElementById("newsDate").value,
        featured: document.getElementById("newsFeatured").checked,
        imageData,
        imageName,
        imageFileId
      };
      if (payload.featured) news = news.map((item) => ({ ...item, featured: false }));
      if (index >= 0) news[index] = payload;
      else news.unshift(payload);
      try {
        EduFamilyStore.saveNews(news);
      } catch (error) {
        const compactNews = compactInlineNewsImages(news);
        try {
          EduFamilyStore.saveNews(compactNews);
          EduFamilyStore.showToast("News saved. Old inline image data was cleared to free browser storage.");
        } catch (retryError) {
          EduFamilyStore.showToast("Could not save news. Clear old browser site data and try again.");
          return;
        }
      }
      EduFamilyStore.closeModal(adminNewsModal);
      EduFamilyStore.showToast(index >= 0 ? "News article updated" : "News article added");
      renderDashboard();
    });
  }

  function bindTableActions() {
    document.addEventListener("click", (event) => {
      const editResource = event.target.closest("[data-edit-resource]");
      const deleteResource = event.target.closest("[data-delete-resource]");
      const editNews = event.target.closest("[data-edit-news]");
      const deleteNews = event.target.closest("[data-delete-news]");

      if (editResource) fillResourceForm(editResource.dataset.editResource);
      if (deleteResource) deleteResourceItem(deleteResource.dataset.deleteResource);
      if (editNews) fillNewsForm(editNews.dataset.editNews);
      if (deleteNews) deleteNewsItem(deleteNews.dataset.deleteNews);
    });
  }

  function fillResourceForm(id) {
    const item = EduFamilyStore.getResources().find((resource) => resource.id === id);
    if (!item) return;
    document.getElementById("resourceId").value = item.id;
    document.getElementById("resourceTitle").value = item.title;
    document.getElementById("resourceCategory").value = item.category;
    document.getElementById("resourceDescription").value = item.description;
    document.getElementById("resourceDate").value = item.date;
    document.getElementById("resourceFile").value = "";
    document.getElementById("resourceFileHelp").textContent = item.fileName ? `Current PDF: ${item.fileName}. Upload a new PDF to replace it.` : "This resource uses a published PDF link. Upload a PDF to replace it.";
    document.getElementById("resourceModalTitle").textContent = "Edit Resource";
    EduFamilyStore.openModal(resourceModal);
  }

  function deleteResourceItem(id) {
    if (!confirm("Delete this resource? This action cannot be undone.")) return;
    EduFamilyStore.saveResources(EduFamilyStore.getResources().filter((item) => item.id !== id), id);
    EduFamilyStore.showToast("Resource deleted");
    renderDashboard();
  }

  function fillNewsForm(id) {
    const item = EduFamilyStore.getNews().find((article) => article.id === id);
    if (!item) return;
    document.getElementById("newsId").value = item.id;
    document.getElementById("newsTitle").value = item.title;
    document.getElementById("newsSummary").value = item.summary;
    document.getElementById("newsBody").value = item.body;
    document.getElementById("newsDate").value = item.date;
    document.getElementById("newsFeatured").checked = item.featured;
    document.getElementById("newsImage").value = "";
    document.getElementById("newsImageHelp").textContent = item.imageName ? `Current image: ${item.imageName}. Upload a new image to replace it.` : "No image uploaded yet. Add an image to show it on the news page.";
    document.getElementById("newsModalTitle").textContent = "Edit News Article";
    EduFamilyStore.openModal(adminNewsModal);
  }

  function deleteNewsItem(id) {
    if (!confirm("Delete this news article? This action cannot be undone.")) return;
    EduFamilyStore.saveNews(EduFamilyStore.getNews().filter((item) => item.id !== id), id);
    EduFamilyStore.showToast("News article deleted");
    renderDashboard();
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function compactInlineResourceFiles(resources) {
    return resources.map((item) => ({
      ...item,
      fileData: item.fileId ? "" : "",
      link: item.link && item.link.startsWith("data:") ? "" : item.link
    }));
  }

  function compactInlineNewsImages(news) {
    return news.map((item) => ({
      ...item,
      imageData: item.imageFileId ? "" : ""
    }));
  }

  function bindPasswordChange() {
    if (!passwordForm) return;
    passwordForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setPasswordMessage("");
      if (!supabaseClient) {
        setPasswordMessage("Supabase is not available.");
        return;
      }
      const currentPassword = document.getElementById("currentPassword").value.trim();
      const newPassword = document.getElementById("newPassword").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

      if (!currentPassword || !newPassword || !confirmPassword) {
        setPasswordMessage("All fields are required.");
        return;
      }

      if (newPassword.length < 6) {
        setPasswordMessage("New password must be at least 6 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMessage("New passwords do not match.");
        return;
      }

      if (newPassword === currentPassword) {
        setPasswordMessage("New password must be different from current password.");
        return;
      }

      setPasswordLoading(true);
      try {
        // Re-authenticate with current password first
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session || !session.user) {
          setPasswordMessage("No active session. Please log in again.");
          return;
        }

        const email = session.user.email;
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: email,
          password: currentPassword
        });

        if (signInError) {
          setPasswordMessage("Current password is incorrect.");
          return;
        }

        // Update to new password
        const { error: updateError } = await supabaseClient.auth.updateUser({
          password: newPassword
        });

        if (updateError) {
          setPasswordMessage(updateError.message || "Could not update password. Please try again.");
          return;
        }

        setPasswordMessage("Password updated successfully!", "success");
        EduFamilyStore.showToast("Password updated successfully");
        passwordForm.reset();
      } catch (error) {
        setPasswordMessage(error.message || "An error occurred. Please try again.");
      } finally {
        setPasswordLoading(false);
      }
    });
  }

  function setPasswordMessage(message, type = "error") {
    if (!passwordMessage) return;
    passwordMessage.textContent = message;
    passwordMessage.classList.toggle("success", type === "success");
  }

  function setPasswordLoading(isLoading) {
    if (!passwordSubmitBtn) return;
    passwordSubmitBtn.disabled = isLoading;
    passwordSubmitBtn.textContent = isLoading ? "Updating..." : "Update Password";
  }

  async function loadProfileInfo() {
    if (!supabaseClient || !profileEmail) return;
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        profileEmail.textContent = session.user.email;
      }
    } catch (e) {
      profileEmail.textContent = "Unable to load email";
    }
  }

  function bindPasswordToggles() {
    document.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-password-toggle]");
      if (!toggle) return;
      const targetId = toggle.dataset.passwordToggle;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.innerHTML = isPassword
        ? '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      toggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const safeInit = (fn) => {
      try { fn(); } catch (e) { console.error("Init Error:", e); }
    };

    safeInit(bindAuth);
    safeInit(bindLogout);
    safeInit(bindTabs);
    safeInit(bindAdminMobileMenu);
    safeInit(bindResourceManagement);
    safeInit(bindNewsManagement);
    safeInit(bindTableActions);
    safeInit(bindPasswordChange);
    safeInit(bindPasswordToggles);
    safeInit(loadProfileInfo);      // 1. Quick local session check
    const { data } = await supabaseClient.auth.getSession();
    setAdminView(!!(data && data.session));

    // 2. Listen for auth changes after initial load
    if (supabaseClient) {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
          setAdminView(!!session);
        }
      });
    }
  });

  window.addEventListener("storage", (event) => {
    if ([EduFamilyStore.RESOURCE_KEY, EduFamilyStore.NEWS_KEY, "eduFamily.updated"].includes(event.key)) {
      renderDashboard();
    }
  });
  window.addEventListener("eduFamilyRefresh", renderDashboard);
})();
