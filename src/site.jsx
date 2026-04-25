import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { useArticles, slugify } from "./useArticles";
import { ThemeContext, themes, useTheme } from "./theme";
import { AdminLogin, AdminPanel } from "./admin";

const PHOTO = "/photo.jpg";

const TIMELINE = [
  { year: "Present", months: [{ month: "", items: [
    { title: "Founded EduGrands", desc: "Built from my bedroom with just a laptop and frustration. Launched to connect youth with global opportunities — grew to 20,000+ users and generated $10,000+ through strategic partnerships.", type: "venture", duration: "Aug 2023 – Present" },
    { title: "AI Mentor — Digital Generation Uzbekistan", desc: "Mentored 350+ students across 4 national camps in AI and no-code tools. Designed inclusive curriculum for underrepresented and disabled youth.", type: "leadership", duration: "Mar 2024 – Present" },
    { title: "Co-Founded MentorGo", desc: "Built the platform with a 4-person team. Supported 200+ monthly sessions, 3,000+ users, and helped students collectively secure over $1M in scholarships.", type: "venture", duration: "Dec 2024 – Present" },
    { title: "Operations Head — Startup Ambassadors", desc: "Working with 208 young people to help them figure out if their ideas actually solve real problems.", type: "leadership", duration: "Jan 2026 – Present" },
  ]}]},
  { year: "2025", months: [
    { month: "September", items: [{ title: "School President — NIS AI School", desc: "Led monthly debates, intellectual competitions, and organized 'Ideathon' with 100+ students fostering critical thinking.", type: "leadership", duration: "Sep – Nov 2025" }]},
    { month: "July", items: [{ title: "Co-Founded Lumora", desc: "Organized 15 national IT case competitions in 10 regions, engaging 1,000+ students and collaborating with 15 industries.", type: "venture", duration: "Jul – Dec 2025" }]},
  ]},
  { year: "2024", months: [
    { month: "June", items: [{ title: "AI Researcher — New Uzbekistan University", desc: "Developed DavomatAI, an AI-powered attendance system that reduced manual record-keeping time by ~4 hours per month.", type: "research", duration: "Jun – Jul 2024" }]},
    { month: "April", items: [{ title: "Robotics Engineer Intern — Robbit", desc: "Built and tested robotics prototypes, contributed to debugging and iterative improvement processes.", type: "research", duration: "Apr – Jun 2024" }]},
  ]},
];

const PROJECTS = [
  {
    name: "EduGrands",
    role: "Founder",
    emoji: "🎓",
    color: "#D97706",
    desc: "Built from my bedroom with just a laptop and frustration. EduGrands is an edtech platform that now serves 30,000+ students across Central Asia.",
    image: "",
    link: "https://edugrands.com",
  },
  {
    name: "MentorGo",
    role: "Co-Founder",
    emoji: "🤝",
    color: "#2563EB",
    desc: "MentorGo connects students with grant winners and high achievers for 1-on-1 consultations. We've helped students secure over $1M in scholarships.",
    image: "",
    link: "https://mentorgo.uz",
  },
  {
    name: "Lumora",
    role: "Co-Founder",
    emoji: "🏆",
    color: "#7C3AED",
    desc: "We built Lumora and brought 15 competitions to 10 cities. Over 1,000 students participated.",
    image: "",
    link: "https://lumora.uz",
  },
];

const typeColorMap = { leadership: { light: "#2563EB", dark: "#60A5FA" }, venture: { light: "#D97706", dark: "#FBBF24" }, research: { light: "#7C3AED", dark: "#A78BFA" }, community: { light: "#059669", dark: "#34D399" } };

// ── Helpers ──────────────────────────────────
const mono = "'IBM Plex Mono', monospace";
const sans = "'IBM Plex Sans', sans-serif";
const serif = "'Instrument Serif', serif";

function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold: 0.08 }); obs.observe(el); return () => obs.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`, ...style }}>{children}</div>;
}
function FadeIn({ children, delay = 0, style = {} }) {
  return <div style={{ animation: `fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s both`, ...style }}>{children}</div>;
}
function SectionLabel({ children }) {
  const t = useTheme();
  return <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: t.textFaint, marginBottom: 48, paddingBottom: 16, borderBottom: `1px solid ${t.border}` }}>{children}</div>;
}

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [pathname]);
  return null;
}

// ── Layout ───────────────────────────────────
function Layout({ children, isDark, toggleDark }) {
  const t = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  // [label, path]
  const links = [
    ["About", "/about"],
    ["Gallery", "/gallery"],
    ["Journey", "/journey"],
    ["Projects", "/projects"],
    ["Writing", "/writing"],
    ["Contact", "/contact"],
  ];

  const navLinkStyle = (isActive) => ({
    fontFamily: sans, fontSize: 13,
    color: isActive ? t.text : t.textMuted,
    background: isActive ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "none",
    border: "none", cursor: "pointer", padding: "7px 16px", borderRadius: 8,
    transition: "all 0.3s", textDecoration: "none", display: "inline-block",
  });

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: serif, transition: "background 0.5s, color 0.5s" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, opacity: t.grain, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat" }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "0 clamp(20px,4vw,40px)", height: 64, display: "flex", justifyContent: "space-between", alignItems: "center", background: scrolled ? t.navBg : "transparent", backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none", borderBottom: scrolled ? `1px solid ${t.border}` : "1px solid transparent", zIndex: 100, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <Link to="/" style={{ fontFamily: serif, fontSize: 24, color: t.text, textDecoration: "none", padding: 0, transition: "opacity 0.3s" }} onMouseEnter={e => e.currentTarget.style.opacity = "0.6"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>N<span style={{ color: t.accent }}>.</span></Link>
        <div className="desk-links" style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} style={({ isActive }) => navLinkStyle(isActive)}>{label}</NavLink>
          ))}
          <button onClick={toggleDark} style={{ background: "none", border: `1px solid ${t.border}`, cursor: "pointer", padding: "6px 10px", borderRadius: 8, marginLeft: 8, fontSize: 14, lineHeight: 1, color: t.textMuted, transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}>{isDark ? "☀️" : "🌙"}</button>
        </div>
        <div className="mob-controls" style={{ display: "none", alignItems: "center", gap: 8 }}>
          <button onClick={toggleDark} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, fontSize: 16, color: t.textMuted }}>{isDark ? "☀️" : "🌙"}</button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: t.text, fontSize: 18, transition: "transform 0.3s", transform: menuOpen ? "rotate(90deg)" : "none" }}>{menuOpen ? "✕" : "☰"}</button>
        </div>
      </nav>

      <div style={{ position: "fixed", inset: 0, paddingTop: 64, background: t.overlayBg, backdropFilter: "blur(24px)", zIndex: 99, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none", transition: "opacity 0.4s" }}>
        {[["Home", "/"], ...links].map(([label, path], i) => (
          <NavLink key={path} to={path} onClick={() => setMenuOpen(false)} style={({ isActive }) => ({ fontFamily: serif, fontSize: 32, color: isActive ? t.accent : t.textMuted, textDecoration: "none", padding: "10px 24px", transition: "all 0.3s", transform: menuOpen ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 0.04}s`, opacity: menuOpen ? 1 : 0 })}>{label}</NavLink>
        ))}
      </div>

      <div style={{ animation: "pageIn 0.6s cubic-bezier(0.16,1,0.3,1) both" }}>{children}</div>

      <footer style={{ padding: "32px clamp(20px,4vw,40px)", borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 860, margin: "0 auto", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: t.textFaint }}>© 2026 Nurbek Alisherov</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: t.textFaint }}>Tashkent, Uzbekistan 🇺🇿</span>
      </footer>
    </div>
  );
}

// ── Pages ────────────────────────────────────
function HomePage() {
  const t = useTheme();
  return (
    <section style={{ padding: "0 clamp(20px,4vw,24px)", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 100, paddingBottom: 40 }}>
        <div className="hero-flex" style={{ display: "flex", alignItems: "center", gap: 56, width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FadeIn delay={0.1}><div style={{ fontFamily: mono, fontSize: 11, color: t.textFaint, letterSpacing: "0.12em", marginBottom: 28, textTransform: "uppercase" }}><span style={{ display: "inline-block", width: 24, height: 1, background: t.accent, verticalAlign: "middle", marginRight: 12 }} />Tashkent, Uzbekistan</div></FadeIn>
            <FadeIn delay={0.2}><h1 style={{ fontSize: "clamp(42px,7vw,72px)", fontFamily: serif, fontWeight: 400, lineHeight: 1.0, marginBottom: 28, color: t.text, letterSpacing: "-0.03em" }}>Nurbek<br />Alisherov</h1></FadeIn>
            <FadeIn delay={0.35}><p style={{ fontSize: "clamp(16px,2vw,19px)", fontFamily: serif, fontStyle: "italic", lineHeight: 1.7, color: t.textMuted, maxWidth: 440, marginBottom: 40 }}>I see things that are broken and build things to fix them — starting with education in Central Asia.</p></FadeIn>
            <FadeIn delay={0.5}><div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/contact" style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: "#fff", background: t.accent, textDecoration: "none", padding: "12px 30px", borderRadius: 100, border: "none", transition: "all 0.35s", boxShadow: `0 2px 12px ${t.accent}30`, display: "inline-block" }} onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.transform = "translateY(0)"; }}>Get in touch</Link>
              <Link to="/writing" style={{ fontFamily: sans, fontSize: 13, color: t.textSoft, border: `1px solid ${t.border}`, background: "none", padding: "12px 30px", borderRadius: 100, textDecoration: "none", transition: "all 0.35s", display: "inline-block" }} onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSoft; }}>Read my writing →</Link>
            </div></FadeIn>
          </div>
          <FadeIn delay={0.5} style={{ flexShrink: 0 }}>
            <div className="hero-photo" style={{ width: 260, height: 320, borderRadius: 20, overflow: "hidden", border: `1px solid ${t.border}`, boxShadow: t.shadowHover }}>
              {PHOTO ? <img src={PHOTO} alt="Nurbek" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> :
              <div style={{ width: "100%", height: "100%", background: t.isDark ? "linear-gradient(145deg,#292524,#1C1917)" : "linear-gradient(145deg,#e8e0d4,#d4c8b8,#c8bcac)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 48, opacity: 0.2 }}>📷</span></div>}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ── About Page ───────────────────────────────
function AboutPage({ aboutText }) {
  const t = useTheme();
  return (
    <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 760, margin: "0 auto" }}>
      <Reveal><SectionLabel>About</SectionLabel></Reveal>
      <Reveal delay={0.08}>
        <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,40px)", lineHeight: 1.25, marginBottom: 40, color: t.text, letterSpacing: "-0.01em" }}>
          {aboutText.heading}
        </h2>
      </Reveal>
      {[aboutText.p1, aboutText.p2, aboutText.p3].map((para, i) => (
        <Reveal key={i} delay={0.12 + i * 0.06}>
          <p style={{ fontFamily: sans, fontSize: 16, fontWeight: 300, lineHeight: 1.95, color: t.textSoft, marginBottom: 24 }}>{para}</p>
        </Reveal>
      ))}
      <Reveal delay={0.4}>
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${t.border}`, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/journey" style={{ fontFamily: sans, fontSize: 13, color: t.textSoft, border: `1px solid ${t.border}`, padding: "12px 26px", borderRadius: 100, textDecoration: "none", transition: "all 0.35s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSoft; }}>See my journey →</Link>
          <Link to="/contact" style={{ fontFamily: sans, fontSize: 13, fontWeight: 500, color: "#fff", background: t.accent, padding: "12px 26px", borderRadius: 100, textDecoration: "none", transition: "all 0.35s" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.accent; }}>Get in touch</Link>
        </div>
      </Reveal>
    </section>
  );
}

// ── Gallery (Carousel) ───────────────────────
function GalleryPage() {
  const t = useTheme();
  const [lightbox, setLightbox] = useState(null);
  const trackRef = useRef(null);

  const gallery = [
    { src: "/gallery/school-1.jpg", caption: "School life" },
    { src: "/gallery/event-1.jpg", caption: "Digital Generation camp" },
    { src: "/gallery/daily-1.jpg", caption: "" },
    { src: "/gallery/event-2.jpg", caption: "Mentoring session" },
    { src: "/gallery/travel-1.jpg", caption: "" },
    { src: "/gallery/school-2.jpg", caption: "" },
    { src: "/gallery/event-3.jpg", caption: "Ideathon 2025" },
    { src: "/gallery/daily-2.jpg", caption: "" },
    { src: "/gallery/travel-2.jpg", caption: "" },
    { src: "/gallery/event-4.jpg", caption: "" },
    { src: "/gallery/daily-3.jpg", caption: "At the bazaar" },
    { src: "/gallery/school-3.jpg", caption: "" },
  ];

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const dist = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: dist, behavior: "smooth" });
  };

  return (
    <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 1200, margin: "0 auto" }}>
      <Reveal><SectionLabel>Gallery</SectionLabel></Reveal>

      <Reveal delay={0.1}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, gap: 24, flexWrap: "wrap" }}>
          <p style={{ fontFamily: serif, fontSize: 20, fontStyle: "italic", color: t.textMuted, maxWidth: 460 }}>
            Moments from school, camps, travels, and everything in between.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => scrollByCards(-1)} aria-label="Previous"
              style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.bgCard, color: t.textSoft, cursor: "pointer", fontSize: 18, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSoft; }}>←</button>
            <button onClick={() => scrollByCards(1)} aria-label="Next"
              style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.bgCard, color: t.textSoft, cursor: "pointer", fontSize: 18, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSoft; }}>→</button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div
          ref={trackRef}
          className="carousel-track"
          style={{
            display: "flex",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: 16,
            scrollbarWidth: "none",
          }}
        >
          {gallery.map((item, i) => (
            <div
              key={i}
              onClick={() => setLightbox(i)}
              className="carousel-card"
              style={{
                flex: "0 0 auto",
                width: "clamp(240px, 32vw, 360px)",
                height: 380,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                border: `1px solid ${t.border}`,
                background: t.isDark ? "linear-gradient(135deg,#292524,#1C1917)" : "linear-gradient(145deg,#e8e0d4,#d4c8b8,#c8bcac)",
                scrollSnapAlign: "start",
                position: "relative",
                transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = t.shadowHover; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <img
                src={item.src}
                alt={item.caption || "Gallery photo"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ fontSize: 32, opacity: 0.15, marginBottom: 8 }}>📷</span>
              </div>
              {item.caption && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "32px 16px 14px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                }}>
                  <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 400, color: "#fff", letterSpacing: "0.02em" }}>{item.caption}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", animation: "fadeUp 0.3s ease both" }}>
          <img src={gallery[lightbox].src} alt={gallery[lightbox].caption || ""} style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
          {gallery[lightbox].caption && (
            <div style={{ position: "absolute", bottom: 40, fontFamily: sans, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{gallery[lightbox].caption}</div>
          )}
          <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox > 0 ? lightbox - 1 : gallery.length - 1); }}
            style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 24, width: 48, height: 48, borderRadius: "50%", cursor: "pointer", transition: "background 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>←</button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox < gallery.length - 1 ? lightbox + 1 : 0); }}
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 24, width: 48, height: 48, borderRadius: "50%", cursor: "pointer", transition: "background 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>→</button>
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 18, width: 40, height: 40, borderRadius: "50%", cursor: "pointer" }}>✕</button>
        </div>
      )}
    </section>
  );
}

// ── Journey ──────────────────────────────────
function JourneyPage() {
  const t = useTheme();
  return (
    <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 860, margin: "0 auto" }}>
      <Reveal><SectionLabel>Journey</SectionLabel></Reveal>
      {TIMELINE.map((block, bi) => (
        <Reveal key={bi} delay={0.1 + bi * 0.06}><div style={{ marginBottom: 52 }}>
          <div style={{ fontFamily: serif, fontSize: 28, color: t.text, marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: bi === 0 ? t.accent : t.textFaint, animation: bi === 0 ? "subtlePulse 2.5s ease-in-out infinite" : "none", boxShadow: bi === 0 ? `0 0 0 4px ${t.accentSoft}` : "none" }} />
            {block.year}
            {bi === 0 && <span style={{ fontFamily: mono, fontSize: 9, color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", background: t.accentSoft, padding: "3px 10px", borderRadius: 100 }}>Now</span>}
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${t.border},transparent)` }} />
          </div>
          {block.months.map((mb, mi) => (
            <div key={mi} style={{ marginBottom: 20, paddingLeft: 22, borderLeft: `1.5px solid ${t.border}` }}>
              {mb.month && <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 500, color: t.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{mb.month}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mb.items.map((item, ii) => {
                  const c = t.isDark ? typeColorMap[item.type].dark : typeColorMap[item.type].light;
                  return (
                    <div key={ii} style={{ padding: "22px 26px", borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = c + "40"; e.currentTarget.style.boxShadow = t.shadowHover; e.currentTarget.style.transform = "translateX(4px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: c + "12", color: c, border: `1px solid ${c}20` }}>{item.type}</span>
                        {item.duration && <span style={{ fontFamily: mono, fontSize: 10, color: item.duration.includes("Present") ? t.accent : t.textFaint }}>{item.duration}</span>}
                      </div>
                      <h4 style={{ fontFamily: sans, fontSize: 16, fontWeight: 550, color: t.text, marginBottom: 6, lineHeight: 1.3 }}>{item.title}</h4>
                      <p style={{ fontFamily: sans, fontSize: 14, fontWeight: 300, lineHeight: 1.8, color: t.textMuted }}>{item.desc}</p>
                    </div>);
                })}
              </div>
            </div>
          ))}
        </div></Reveal>
      ))}
    </section>
  );
}

// ── Projects ─────────────────────────────────
function ProjectsPage({ projects = PROJECTS }) {
  const t = useTheme();
  return (
    <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 960, margin: "0 auto" }}>
      <Reveal><SectionLabel>Projects</SectionLabel></Reveal>
      <Reveal delay={0.05}>
        <p style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", color: t.textMuted, marginBottom: 44, maxWidth: 460 }}>Things I'm building to make education and mentorship more accessible.</p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {projects.map((proj, i) => {
          const hasLink = !!proj.link;
          const CardWrapper = hasLink ? "a" : "div";
          const wrapperProps = hasLink ? { href: proj.link, target: "_blank", rel: "noopener noreferrer" } : {};
          return (
            <Reveal key={i} delay={0.1 + i * 0.08}>
              <CardWrapper
                {...wrapperProps}
                style={{
                  display: "block",
                  padding: 0,
                  borderRadius: 18,
                  background: t.bgCard,
                  border: `1px solid ${t.border}`,
                  transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                  textDecoration: "none",
                  color: "inherit",
                  overflow: "hidden",
                  cursor: hasLink ? "pointer" : "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = proj.color + "40"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = t.shadowHover; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="project-grid" style={{ display: "grid", gridTemplateColumns: "minmax(220px, 320px) 1fr", gap: 0 }}>
                  {/* Image / Visual */}
                  <div style={{
                    height: "100%",
                    minHeight: 200,
                    background: proj.image ? `${proj.color}10` : `linear-gradient(135deg, ${proj.color}18, ${proj.color}05)`,
                    borderRight: `1px solid ${t.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {proj.image ? (
                      <img src={proj.image} alt={proj.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <span style={{ fontSize: 64, opacity: 0.85 }}>{proj.emoji}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: sans, fontSize: 22, fontWeight: 600, color: t.text }}>{proj.name}</h3>
                      <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, background: proj.color + "10", color: proj.color, border: `1px solid ${proj.color}20` }}>{proj.role}</span>
                    </div>
                    <p style={{ fontFamily: sans, fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: t.textMuted, marginBottom: hasLink ? 18 : 0 }}>{proj.desc}</p>
                    {hasLink && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontFamily: sans, fontSize: 13, fontWeight: 500, color: proj.color,
                        alignSelf: "flex-start",
                        padding: "8px 18px", borderRadius: 100,
                        border: `1px solid ${proj.color}30`,
                        background: proj.color + "08",
                        transition: "all 0.3s",
                      }}>
                        Visit <span aria-hidden>→</span>
                      </span>
                    )}
                  </div>
                </div>
              </CardWrapper>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

// ── Writing list ─────────────────────────────
function WritingPage({ articles }) {
  const t = useTheme();
  const [hovered, setHovered] = useState(null);
  const MO = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = [...new Set(articles.map(p => p.year))].sort((a, b) => b - a);
  const grouped = {};
  years.forEach(y => { const yp = articles.filter(p => p.year === y); const ms = [...new Set(yp.map(p => p.month))].sort((a, b) => MO.indexOf(b) - MO.indexOf(a)); grouped[y] = {}; ms.forEach(m => { grouped[y][m] = yp.filter(p => p.month === m); }); });

  return (
    <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 960, margin: "0 auto" }}>
      <Reveal><SectionLabel>Writing</SectionLabel></Reveal>
      <Reveal delay={0.05}><p style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", color: t.textMuted, marginBottom: 52, maxWidth: 460 }}>I write to understand — about technology, education, and building things that matter.</p></Reveal>
      {years.map((year, yi) => {
        const ya = articles.filter(p => p.year === year);
        return (<div key={year} style={{ marginBottom: 56 }}>
          <Reveal delay={yi * 0.04}><div style={{ fontFamily: serif, fontSize: 28, color: t.text, marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>{year}<span style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${t.border},transparent)` }} /><span style={{ fontFamily: mono, fontSize: 11, color: t.textFaint }}>{ya.length} {ya.length === 1 ? "post" : "posts"}</span></div></Reveal>
          {Object.keys(grouped[year]).map((month, mi) => (
            <div key={month} style={{ marginBottom: 32 }}>
              <Reveal delay={0.04 + mi * 0.03}><div style={{ fontFamily: sans, fontSize: 12, fontWeight: 500, color: t.textFaint, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>{month}</div></Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                {grouped[year][month].map((post, i) => {
                  const idx = `${year}-${month}-${i}`;
                  const slug = post.slug || slugify(post.title);
                  return (<Reveal key={idx} delay={0.04 + i * 0.05}>
                    <Link to={`/writing/${slug}`} onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}
                      style={{ display: "block", textDecoration: "none", borderRadius: 16, overflow: "hidden", background: t.bgCard, border: `1px solid ${t.border}`, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)", transform: hovered === idx ? "translateY(-5px)" : "none", boxShadow: hovered === idx ? t.shadowHover : t.shadow }}>
                      <div style={{ height: 150, background: post.image ? "none" : `linear-gradient(135deg,${post.color}10,${post.color}05)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                        {post.image ? (
                          <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)", transform: hovered === idx ? "scale(1.05)" : "scale(1)" }} />
                        ) : (<>
                          <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", border: `1px solid ${post.color}15` }} />
                          <span style={{ fontFamily: serif, fontSize: 48, color: `${post.color}15`, transition: "transform 0.5s", transform: hovered === idx ? "scale(1.15) rotate(-3deg)" : "scale(1)" }}>{post.title.charAt(0)}</span>
                        </>)}
                      </div>
                      <div style={{ padding: "14px 20px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: post.color, padding: "3px 10px", borderRadius: 100, background: `${post.color}10` }}>{post.tag}</span>
                        </div>
                        <h3 style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.35, marginBottom: 8, color: hovered === idx ? t.accent : t.text, transition: "color 0.35s" }}>{post.title}</h3>
                        <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: t.textMuted }}>{post.excerpt}</p>
                        <div style={{ marginTop: 14, fontFamily: sans, fontSize: 12, color: t.accent, opacity: hovered === idx ? 1 : 0, transform: hovered === idx ? "translateX(0)" : "translateX(-8px)", transition: "all 0.3s" }}>Read article →</div>
                      </div>
                    </Link>
                  </Reveal>);
                })}
              </div>
            </div>
          ))}
        </div>);
      })}
    </section>
  );
}

// ── Single article page ─────────────────────
function ArticleView({ articles }) {
  const t = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = articles.find(a => (a.slug || slugify(a.title)) === slug);

  if (!article) {
    return (
      <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: serif, fontSize: 32, color: t.text, marginBottom: 16 }}>Article not found</h2>
        <p style={{ fontFamily: sans, fontSize: 15, color: t.textMuted, marginBottom: 32 }}>The article you're looking for doesn't exist or has been moved.</p>
        <Link to="/writing" style={{ fontFamily: sans, fontSize: 13, color: t.accent, textDecoration: "none", border: `1px solid ${t.accent}40`, padding: "10px 24px", borderRadius: 100 }}>← Back to Writing</Link>
      </section>
    );
  }

  const contentText = article.content || article.excerpt;
  const paras = contentText.split(/\n\n+/).filter(p => p.trim());
  const readTime = Math.max(1, Math.ceil(contentText.split(/\s+/).length / 200));

  return (
    <section style={{ padding: "120px clamp(20px,4vw,40px) 100px", maxWidth: 720, margin: "0 auto" }}>
      <Reveal>
        <button onClick={() => navigate("/writing")} style={{ fontFamily: sans, fontSize: 13, color: t.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 40, display: "flex", alignItems: "center", gap: 8, transition: "color 0.3s" }} onMouseEnter={e => e.currentTarget.style.color = t.accent} onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>← Back to Writing</button>
      </Reveal>
      <Reveal delay={0.05}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 100, background: article.color + "12", color: article.color, border: `1px solid ${article.color}20` }}>{article.tag}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: t.textFaint }}>{article.date}</span>
      </div></Reveal>
      <Reveal delay={0.1}><h1 style={{ fontFamily: serif, fontSize: "clamp(32px,5vw,48px)", lineHeight: 1.15, marginBottom: 32, color: t.text, letterSpacing: "-0.02em" }}>{article.title}</h1></Reveal>
      {article.image && <Reveal delay={0.12}><div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 32, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
        <img src={article.image} alt={article.title} style={{ width: "100%", height: "auto", maxHeight: 400, objectFit: "cover", display: "block" }} />
      </div></Reveal>}
      <Reveal delay={0.15}><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48, paddingBottom: 32, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.accent + "15", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontSize: 18, color: t.accent }}>N</div>
        <div><div style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: t.text }}>Nurbek Alisherov</div><div style={{ fontFamily: mono, fontSize: 11, color: t.textFaint }}>{article.date} · {readTime} min read</div></div>
      </div></Reveal>
      {paras.map((p, i) => (
        <Reveal key={i} delay={0.2 + i * 0.05}><p style={{ fontFamily: sans, fontSize: 16, fontWeight: 300, lineHeight: 2, color: t.textSoft, marginBottom: 28 }}>{i === 0 ? <span style={{ fontFamily: serif, fontSize: 20, color: t.text, lineHeight: 1.8 }}>{p}</span> : p}</p></Reveal>
      ))}
      <Reveal delay={0.3 + paras.length * 0.05}><div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: t.textFaint }}>Thanks for reading.</span>
        <Link to="/writing" style={{ fontFamily: sans, fontSize: 13, color: t.textMuted, border: `1px solid ${t.border}`, padding: "10px 24px", borderRadius: 100, textDecoration: "none", transition: "all 0.3s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}>← All articles</Link>
      </div></Reveal>
    </section>
  );
}

// ── Contact ──────────────────────────────────
function ContactPage() {
  const t = useTheme();
  return (
    <section style={{ padding: "140px clamp(20px,4vw,40px) 100px", maxWidth: 860, margin: "0 auto" }}>
      <Reveal><SectionLabel>Get in touch</SectionLabel></Reveal>
      <Reveal delay={0.1}>
        <h2 style={{ fontFamily: serif, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.2, marginBottom: 14, color: t.text }}>I'd love to{" "}<span style={{ fontStyle: "italic", color: t.accent, backgroundImage: `linear-gradient(transparent 65%,${t.accent}18 65%)` }}>connect</span>.</h2>
        <p style={{ fontFamily: sans, fontSize: 15, fontWeight: 300, color: t.textMuted, marginBottom: 48, maxWidth: 440, lineHeight: 1.75 }}>Whether you'd like to discuss a shared interest, explore collaboration, or just say hello — my inbox is always open.</p>
      </Reveal>
      <Reveal delay={0.2}><div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
        {[{ icon: "✉️", label: "hello@imnurbek.uz", href: "mailto:hello@imnurbek.uz" }, { icon: "💼", label: "LinkedIn", href: "https://linkedin.com/in/uzalisherov" }, { icon: "💬", label: "Telegram", href: "https://t.me/uzalisherov" }].map((item, i) => (
          <a key={i} href={item.href} target={item.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 26px", borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, textDecoration: "none", color: t.textSoft, transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)", fontFamily: sans, fontSize: 15 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent + "40"; e.currentTarget.style.color = t.text; e.currentTarget.style.transform = "translateX(8px)"; e.currentTarget.style.boxShadow = t.shadowHover; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSoft; e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span><span>{item.label}</span><span style={{ marginLeft: "auto", color: t.textFaint, fontSize: 14 }}>→</span>
          </a>
        ))}
      </div></Reveal>
      <Reveal delay={0.35}><div style={{ marginTop: 80, padding: "28px 0", borderTop: `1px solid ${t.border}` }}>
        <p style={{ fontFamily: serif, fontSize: 15, fontStyle: "italic", color: t.textFaint, lineHeight: 1.6 }}>"The best time to plant a tree was twenty years ago. The second best time is now."</p>
      </div></Reveal>
    </section>
  );
}

// ── App ──────────────────────────────────────
export default function NurbekSite() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? themes.dark : themes.light;
  const { articles, isSupabase, addArticle, updateArticle, deleteArticle } = useArticles();
  const [projectsList, setProjectsList] = useState(PROJECTS);
  const [aboutText, setAboutText] = useState({
    heading: "Every project starts the same — I see something broken, and I can't walk past it.",
    p1: "I'm Nurbek Alisherov, a senior high school student from Uzbekistan. My journey with technology started at six when my dad gifted me my first computer. By ten, I was teaching myself Python during power outages after the internet finally reached my village. But what really changed me wasn't code — it was watching my friends miss scholarships just because nobody told them they existed.",
    p2: "I built EduGrands from my bedroom — just a laptop and frustration. Now 30,000 students use it. A student once messaged me saying they got into a prestigious program through the platform. Their parents were crying. I was 16, standing in our apple orchard. Something I'd built between homework and selling apples was affecting families I'd never meet. So I kept building: MentorGo, Lumora, Digital Generation — teaching AI to 350+ children from villages where people barely know what AI is.",
    p3: "My family grows apples — 2 hectares. On weekends I sell them at the bazaar, haggling with grandmas who've known me since I was five. In the mornings, I work with 208 youth through Startup Ambassadors. It keeps me grounded. I'm not trying to be impressive. I just can't leave things broken.",
  });

  useEffect(() => { let b = ""; const h = (e) => { b += e.key; if (b.length > 5) b = b.slice(-5); if (b === "admin") { setIsAdmin(true); b = ""; } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);

  const handleUpdate = (type, data) => { if (type === "projects") setProjectsList(data); if (type === "about") setAboutText(data); };
  const toggleDark = () => setIsDark(!isDark);

  if (isAdmin && !adminAuth) return <ThemeContext.Provider value={theme}><AdminLogin onLogin={() => setAdminAuth(true)} /></ThemeContext.Provider>;
  if (isAdmin && adminAuth) return <ThemeContext.Provider value={theme}><AdminPanel articles={articles} projects={projectsList} aboutText={aboutText} onUpdate={handleUpdate} onLogout={() => { setIsAdmin(false); setAdminAuth(false); }} onAddArticle={addArticle} onUpdateArticle={updateArticle} onDeleteArticle={deleteArticle} isSupabase={isSupabase} /></ThemeContext.Provider>;

  return (
    <ThemeContext.Provider value={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Instrument+Serif:ital@0;1&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
        ::selection{background:${theme.accent}25;color:${theme.text}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes subtlePulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes gentleBounce{0%,100%{opacity:.2;transform:translateX(-50%) translateY(0)}50%{opacity:.5;transform:translateX(-50%) translateY(8px)}}
        .carousel-track::-webkit-scrollbar{display:none}
        @media(max-width:760px){.project-grid{grid-template-columns:1fr!important}.project-grid > div:first-child{min-height:180px!important;border-right:none!important;border-bottom:1px solid ${theme.border}}}
        @media(max-width:640px){.hero-flex{flex-direction:column-reverse!important;align-items:flex-start!important;gap:32px!important}.hero-photo{width:180px!important;height:220px!important}.desk-links{display:none!important}.mob-controls{display:flex!important}.admin-sidebar{display:none!important}div[style*="marginLeft: 220"]{margin-left:0!important}}
        @media(min-width:641px){.mob-controls{display:none!important}}
      `}</style>
      <BrowserRouter>
        <ScrollToTop />
        <Layout isDark={isDark} toggleDark={toggleDark}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage aboutText={aboutText} />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/projects" element={<ProjectsPage projects={projectsList} />} />
            <Route path="/writing" element={<WritingPage articles={articles} />} />
            <Route path="/writing/:slug" element={<ArticleView articles={articles} />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
