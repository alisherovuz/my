import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// Convert a title into a URL-friendly slug
export function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Add a slug to each article based on its title
function withSlugs(arr) {
  return arr.map((a, i) => ({ ...a, slug: a.slug || slugify(a.title) || `article-${i}` }));
}

// Fallback data when Supabase is not configured
const LOCAL_ARTICLES = [
  { title: "Why Uzbekistan's AI Future Starts in the Classroom", excerpt: "The gap between what we teach and what the world needs is widening — and Central Asia has a unique opportunity to leapfrog.", date: "January 2026", year: 2026, month: "January", tag: "Education", color: "#059669" },
  { title: "Building EduGrands: Lessons from Year One", excerpt: "What nobody tells you about building an edtech startup in Central Asia — the honest version.", date: "December 2025", year: 2025, month: "December", tag: "Startups", color: "#B86200" },
  { title: "The Mentor's Paradox", excerpt: "Teaching AI to the next generation made me question everything I thought I knew about learning itself.", date: "November 2025", year: 2025, month: "November", tag: "Reflection", color: "#7C3AED" },
  { title: "How I Built My First NLP Model for Uzbek", excerpt: "A deep dive into the challenges of working with low-resource languages and what I learned along the way.", date: "October 2025", year: 2025, month: "October", tag: "AI / Tech", color: "#2563EB" },
  { title: "What Running a Startup Taught Me About Learning", excerpt: "The overlap between entrepreneurship and education is bigger than you'd think.", date: "September 2025", year: 2025, month: "September", tag: "Startups", color: "#B86200" },
  { title: "On Finding Your Thing Early", excerpt: "You don't need to have it all figured out — but it helps to start looking.", date: "August 2025", year: 2025, month: "August", tag: "Reflection", color: "#7C3AED" },
];

const colorMap = {
  "AI / Tech": "#2563EB",
  Education: "#059669",
  Startups: "#B86200",
  Reflection: "#7C3AED",
};

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const isSupabase = !!supabase;

  // Fetch
  const fetchArticles = useCallback(async () => {
    if (!supabase) {
      setArticles(withSlugs(LOCAL_ARTICLES));
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("year", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(withSlugs(data || []));
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setArticles(withSlugs(LOCAL_ARTICLES));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  // Add
  const addArticle = useCallback(async (article) => {
    const newArticle = {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content || "",
      tag: article.tag,
      color: colorMap[article.tag] || "#2563EB",
      year: article.year,
      month: article.month,
      date: `${article.month} ${article.year}`,
    };

    if (!supabase) {
      setArticles((prev) => withSlugs([newArticle, ...prev]));
      return true;
    }

    try {
      const { error } = await supabase.from("articles").insert(newArticle);
      if (error) throw error;
      await fetchArticles();
      return true;
    } catch (err) {
      console.error("Failed to add article:", err);
      return false;
    }
  }, [fetchArticles]);

  // Update
  const updateArticle = useCallback(async (id, article) => {
    const updated = {
      title: article.title,
      excerpt: article.excerpt,
      content: article.content || "",
      tag: article.tag,
      color: colorMap[article.tag] || "#2563EB",
      year: article.year,
      month: article.month,
      date: `${article.month} ${article.year}`,
    };

    if (!supabase) {
      setArticles((prev) => prev.map((a, i) => (i === id ? { ...a, ...updated } : a)));
      return true;
    }

    try {
      const { error } = await supabase.from("articles").update(updated).eq("id", id);
      if (error) throw error;
      await fetchArticles();
      return true;
    } catch (err) {
      console.error("Failed to update article:", err);
      return false;
    }
  }, [fetchArticles]);

  // Delete
  const deleteArticle = useCallback(async (id) => {
    if (!supabase) {
      setArticles((prev) => prev.filter((_, i) => i !== id));
      return true;
    }

    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      await fetchArticles();
      return true;
    } catch (err) {
      console.error("Failed to delete article:", err);
      return false;
    }
  }, [fetchArticles]);

  // Bulk set (for local mode compatibility)
  const setAllArticles = useCallback((data) => {
    if (!supabase) {
      setArticles(data);
    }
  }, []);

  return { articles, loading, isSupabase, addArticle, updateArticle, deleteArticle, setAllArticles };
}
