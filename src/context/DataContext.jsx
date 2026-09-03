import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { saveFile, getFile, getFileUrl } from '../services/indexedDb';

const DataContext = createContext();

const RESOURCE_KEY = "eduFamily.resources";
const NEWS_KEY = "eduFamily.news";
const STORAGE_EVENT = "eduFamily.updated";
const LEGACY_DOMAIN = "https://edufamiy.vercel.app";
const BUCKET_NAME = "resources";

export function DataProvider({ children }) {
  const [resources, setResources] = useState(() => {
    try {
      const stored = localStorage.getItem(RESOURCE_KEY);
      const items = stored ? JSON.parse(stored) : [];
      return items.map((r) => {
        if (r.link && r.link.includes(LEGACY_DOMAIN)) {
          return { ...r, link: r.link.replace(LEGACY_DOMAIN, "https://edufamily.vercel.app") };
        }
        return r;
      });
    } catch {
      return [];
    }
  });

  const [news, setNews] = useState(() => {
    try {
      const stored = localStorage.getItem(NEWS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  const notifyUpdate = useCallback(() => {
    localStorage.setItem(STORAGE_EVENT, String(Date.now()));
  }, []);

  const syncFromSupabase = useCallback(async () => {
    try {
      let dbResources = null;
      const resRes = await supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (resRes.error) {
        const fallback = await supabase.from("resources").select("*");
        dbResources = fallback.data;
      } else {
        dbResources = resRes.data;
      }

      let dbNews = null;
      const newsRes = await supabase.from("news").select("*").order("created_at", { ascending: false });
      if (newsRes.error) {
        const fallback = await supabase.from("news").select("*");
        dbNews = fallback.data;
      } else {
        dbNews = newsRes.data;
      }

      if (Array.isArray(dbResources)) {
        setResources((prev) => {
          const dbIds = new Set(dbResources.map((r) => r.id));
          // Only preserve genuinely unsynced local files waiting to upload
          const unsyncedLocal = prev.filter((r) => !dbIds.has(r.id) && (r.fileId || r.fileData));
          const merged = [...dbResources, ...unsyncedLocal];
          localStorage.setItem(RESOURCE_KEY, JSON.stringify(merged));
          return merged;
        });
      }

      if (Array.isArray(dbNews)) {
        setNews((prev) => {
          const dbIds = new Set(dbNews.map((n) => n.id));
          const unsyncedLocal = prev.filter((n) => !dbIds.has(n.id) && (n.imageFileId || n.imageData));
          const merged = [...dbNews, ...unsyncedLocal];
          localStorage.setItem(NEWS_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn("Supabase Sync Error:", err);
    }
  }, []);

  useEffect(() => {
    syncFromSupabase();

    const channel = supabase
      .channel("public-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, syncFromSupabase)
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, syncFromSupabase)
      .subscribe();

    const handleStorageChange = (e) => {
      if (!e || [RESOURCE_KEY, NEWS_KEY, STORAGE_EVENT].includes(e.key)) {
        try {
          const res = JSON.parse(localStorage.getItem(RESOURCE_KEY) || "[]");
          const nws = JSON.parse(localStorage.getItem(NEWS_KEY) || "[]");
          setResources(res);
          setNews(nws);
        } catch (err) {
          console.warn("Storage sync parse error", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [syncFromSupabase]);

  const saveResourcesState = async (newResources, deletedId = null) => {
    setResources(newResources);
    localStorage.setItem(RESOURCE_KEY, JSON.stringify(newResources));
    notifyUpdate();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (deletedId) {
          const { error } = await supabase.from("resources").delete().eq("id", deletedId);
          if (error) {
            console.error("Supabase delete error:", error);
            showToast("Error deleting from cloud DB: " + error.message);
          }
        } else {
          const cleanResources = newResources.map(({ fileData, ...r }) => r);
          const { error } = await supabase.from("resources").upsert(cleanResources);
          if (error) {
            console.error("Supabase upsert error:", error);
            showToast("Saved locally. Supabase Sync Error: " + (error.message || "Check DB permissions"));
          }
        }
      } else {
        showToast("Saved to local browser. Log into Admin to sync to online site.");
      }
    } catch (err) {
      console.error("Supabase resources sync failed:", err);
    }
  };

  const saveNewsState = async (newNews, deletedId = null) => {
    setNews(newNews);
    localStorage.setItem(NEWS_KEY, JSON.stringify(newNews));
    notifyUpdate();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (deletedId) {
          const { error } = await supabase.from("news").delete().eq("id", deletedId);
          if (error) {
            console.error("Supabase news delete error:", error);
            showToast("Error deleting from cloud DB: " + error.message);
          }
        } else {
          const { error } = await supabase.from("news").upsert(newNews);
          if (error) {
            console.error("Supabase news upsert error:", error);
            showToast("Saved locally. Supabase Sync Error: " + (error.message || "Check DB permissions"));
          }
        }
      } else {
        showToast("Saved to local browser. Log into Admin to sync to online site.");
      }
    } catch (err) {
      console.error("Supabase news sync failed:", err);
    }
  };

  const autoSyncLocalToSupabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let syncNeeded = false;
      const pendingResources = resources.filter((r) => r.fileId);
      const pendingNews = news.filter((n) => n.imageFileId);

      if (pendingResources.length === 0 && pendingNews.length === 0) {
        return;
      }

      for (const item of pendingResources) {
        try {
          const file = await getFile(item.fileId);
          if (file) {
            const storageId = `resource-${item.id}-${Date.now()}`;
            const filePath = `pdfs/${storageId}.pdf`;
            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(filePath, file, { contentType: "application/pdf", upsert: true });
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
              if (urlData && urlData.publicUrl) {
                const cleanItem = {
                  id: item.id,
                  title: item.title,
                  category: item.category,
                  description: item.description,
                  date: item.date,
                  link: urlData.publicUrl,
                  fileName: item.fileName || ""
                };
                const { error: upsertErr } = await supabase.from("resources").upsert(cleanItem);
                if (!upsertErr) syncNeeded = true;
              }
            }
          }
        } catch (e) {
          console.warn("AutoSync file error:", e);
        }
      }

      for (const item of pendingNews) {
        try {
          const file = await getFile(item.imageFileId);
          if (file) {
            const ext = (file.name || "image.jpg").split(".").pop();
            const storageId = `news-image-${item.id}-${Date.now()}`;
            const filePath = `news/${storageId}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(filePath, file, { contentType: file.type || "image/jpeg", upsert: true });
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
              if (urlData && urlData.publicUrl) {
                const cleanItem = {
                  id: item.id,
                  title: item.title,
                  summary: item.summary,
                  body: item.body,
                  date: item.date,
                  featured: item.featured || false,
                  imageData: urlData.publicUrl,
                  imageName: item.imageName || ""
                };
                const { error: upsertErr } = await supabase.from("news").upsert(cleanItem);
                if (!upsertErr) syncNeeded = true;
              }
            }
          }
        } catch (e) {
          console.warn("AutoSync image error:", e);
        }
      }

      if (syncNeeded) {
        await syncFromSupabase();
        showToast("Auto-synced local offline uploads to Supabase Cloud");
      }
    } catch (syncErr) {
      console.warn("AutoSync Error:", syncErr);
    }
  };

  const isNew = (dateString) => {
    if (!dateString) return false;
    const uploaded = new Date(dateString);
    const diff = (Date.now() - uploaded.getTime()) / 86400000;
    return diff <= 7;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(dateString));
  };

  return (
    <DataContext.Provider
      value={{
        resources,
        news,
        toastMessage,
        showToast,
        saveResourcesState,
        saveNewsState,
        autoSyncLocalToSupabase,
        isNew,
        formatDate,
        saveFile,
        getFile,
        getFileUrl
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
