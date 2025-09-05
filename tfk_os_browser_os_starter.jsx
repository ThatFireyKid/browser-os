import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================
// TFK-OS — a browser-based "OS"
// Single-file starter you can run, tweak, and ship.
// Features: desktop, taskbar, app launcher, draggable windows,
// notes (persistent), mock terminal, mini browser, settings, files mock.
// =============================

export default function TFKOS() {
  // ===== THEME & WALLPAPER =====
  const [theme, setTheme] = useState(() => localStorage.getItem("tfkos.theme") || "dark");
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem("tfkos.wallpaper") || "nebula");

  useEffect(() => {
    localStorage.setItem("tfkos.theme", theme);
    localStorage.setItem("tfkos.wallpaper", wallpaper);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, wallpaper]);

  // ===== APP REGISTRY =====
  const registry = useMemo(() => ({
    notes: {
      id: "notes",
      name: "Notes",
      icon: "📝",
      width: 460,
      height: 380,
      component: NotesApp,
    },
    terminal: {
      id: "terminal",
      name: "Terminal",
      icon: ">_",
      width: 560,
      height: 360,
      component: TerminalApp,
    },
    browser: {
      id: "browser",
      name: "Mini Browser",
      icon: "🌐",
      width: 740,
      height: 480,
      component: MiniBrowserApp,
    },
    files: {
      id: "files",
      name: "Files",
      icon: "📁",
      width: 520,
      height: 400,
      component: FilesApp,
    },
    settings: {
      id: "settings",
      name: "Settings",
      icon: "⚙️",
      width: 520,
      height: 420,
      component: SettingsApp,
    },
  }), []);

  // ===== WINDOW MANAGER =====
  const [z, setZ] = useState(2);
  const [windows, setWindows] = useState([]);
  const [showLauncher, setShowLauncher] = useState(false);

  function openApp(appId, opts = {}) {
    const app = registry[appId];
    if (!app) return;

    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId && !w.minimized);
      const base = {
        id: crypto.randomUUID(),
        appId: app.id,
        title: app.name,
        x: Math.max(16, 60 + Math.random() * 80),
        y: Math.max(16, 60 + Math.random() * 40),
        w: app.width,
        h: app.height,
        z: z + 1,
        minimized: false,
      };
      setZ((v) => v + 1);
      if (existing) {
        // Bring existing app to front instead of spawning new
        return prev.map((w) => (w.appId === appId ? { ...w, z: z + 1, minimized: false } : w));
      }
      return [...prev, { ...base, ...opts }];
    });
  }

  function closeWindow(id) {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }

  function minimizeWindow(id) {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }

  function focusWindow(id) {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, z: z + 1, minimized: false } : w))
    );
    setZ((v) => v + 1);
  }

  // Keyboard shortcuts: Win/Ctrl+Space to toggle launcher, Esc closes launcher
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === " ") {
        e.preventDefault();
        setShowLauncher((s) => !s);
      }
      if (e.key === "Escape") setShowLauncher(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Desktop icons
  const desktopIcons = [
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "terminal", label: "Terminal", icon: ">_" },
    { id: "browser", label: "Mini Browser", icon: "🌐" },
    { id: "files", label: "Files", icon: "📁" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className={`w-screen h-screen overflow-hidden ${theme === "dark" ? "bg-neutral-900 text-neutral-100" : "bg-neutral-100 text-neutral-900"}`}>
      <Wallpaper kind={wallpaper} />

      {/* Desktop icons */}
      <div className="absolute inset-0 p-4 grid grid-cols-6 gap-3 select-none">
        {desktopIcons.map((d) => (
          <DesktopIcon key={d.id} icon={d.icon} label={d.label} onOpen={() => openApp(d.id)} />
        ))}
      </div>

      {/* Windows */}
      {windows
        .filter((w) => !w.minimized)
        .sort((a, b) => a.z - b.z)
        .map((w) => (
          <Window
            key={w.id}
            {...w}
            onFocus={() => focusWindow(w.id)}
            onClose={() => closeWindow(w.id)}
            onMinimize={() => minimizeWindow(w.id)}
          >
            {React.createElement(registry[w.appId].component, {
              theme,
              setTheme,
              wallpaper,
              setWallpaper,
              openApp,
            })}
          </Window>
        ))}

      {/* Taskbar */}
      <Taskbar
        theme={theme}
        setTheme={setTheme}
        onToggleLauncher={() => setShowLauncher((s) => !s)}
        windows={windows}
        onClickWindow={(id) => focusWindow(id)}
      />

      {/* Launcher */}
      {showLauncher && (
        <Launcher
          apps={Object.values(registry)}
          onOpen={(id) => {
            openApp(id);
            setShowLauncher(false);
          }}
          onClose={() => setShowLauncher(false)}
        />
      )}
    </div>
  );
}

// ======== UI PRIMITIVES ========
function Wallpaper({ kind }) {
  const map = {
    nebula: "bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700",
    ocean: "bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600",
    sunset: "bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600",
    steel: "bg-gradient-to-br from-neutral-700 via-stone-700 to-zinc-800",
  };
  return <div className={`absolute inset-0 ${map[kind] || map.nebula}`} />;
}

function DesktopIcon({ icon, label, onOpen }) {
  return (
    <button
      onDoubleClick={onOpen}
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition"
      title="Double-click to open"
    >
      <div className="text-3xl drop-shadow">{icon}</div>
      <div className="text-sm font-medium text-center">{label}</div>
    </button>
  );
}

function Taskbar({ theme, setTheme, onToggleLauncher, windows, onClickWindow }) {
  const time = useClock();
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 backdrop-blur bg-black/30 dark:bg-black/40 text-white flex items-center px-2 gap-2">
      <button onClick={onToggleLauncher} className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20">⌘</button>
      <div className="flex-1 flex items-center gap-2 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => onClickWindow(w.id)}
            className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 truncate"
            title={w.title}
          >
            {w.title}
          </button>
        ))}
      </div>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20"
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>
      <div className="px-3 py-1 rounded-xl bg-white/10 select-none">{time}</div>
    </div>
  );
}

function Launcher({ apps, onOpen, onClose }) {
  const [query, setQuery] = useState("");
  const list = apps.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="absolute left-4 bottom-14 w-[520px] max-h-[60vh] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="p-3 backdrop-blur bg-black/40 text-white">
        <div className="text-lg font-semibold mb-2">Launcher</div>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps… (Esc to close)"
          className="w-full px-3 py-2 rounded-xl bg-white/10 focus:outline-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 backdrop-blur bg-black/30 text-white">
        {list.map((a) => (
          <button
            key={a.id}
            onClick={() => onOpen(a.id)}
            className="flex items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20"
          >
            <span className="text-xl">{a.icon}</span>
            <span className="font-medium">{a.name}</span>
          </button>
        ))}
        {list.length === 0 && <div className="col-span-3 text-center opacity-70 py-4">No apps match “{query}”.</div>}
      </div>
      <div className="p-2 backdrop-blur bg-black/40 text-right">
        <button onClick={onClose} className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white">Close</button>
      </div>
    </div>
  );
}

function Window({ id, title, x, y, w, h, z, minimized, onClose, onMinimize, onFocus, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x, y });
  const [size, setSize] = useState({ w, h });
  const dragging = useRef(null);
  const resizing = useRef(null);

  useEffect(() => setPos({ x, y }), [x, y]);
  useEffect(() => setSize({ w, h }), [w, h]);

  useEffect(() => {
    function onMove(e) {
      if (dragging.current) {
        const { dx, dy } = dragging.current;
        setPos({ x: e.clientX - dx, y: e.clientY - dy });
      }
      if (resizing.current) {
        const { corner, startX, startY, startW, startH } = resizing.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newW = startW, newH = startH, newX = pos.x, newY = pos.y;
        if (corner.includes("e")) newW = Math.max(360, startW + dx);
        if (corner.includes("s")) newH = Math.max(240, startH + dy);
        if (corner.includes("w")) { newW = Math.max(360, startW - dx); newX = pos.x + dx; }
        if (corner.includes("n")) { newH = Math.max(240, startH - dy); newY = pos.y + dy; }
        setSize({ w: newW, h: newH });
        setPos({ x: newX, y: newY });
      }
    }
    function onUp() { dragging.current = null; resizing.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [pos.x, pos.y]);

  function onMouseDownHeader(e) {
    onFocus?.();
    const rect = ref.current?.getBoundingClientRect();
    dragging.current = { dx: e.clientX - (rect?.left || 0), dy: e.clientY - (rect?.top || 0) };
  }

  function startResize(corner, e) {
    onFocus?.();
    e.stopPropagation();
    resizing.current = { corner, startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };
  }

  const style = { left: pos.x, top: pos.y, width: size.w, height: size.h, zIndex: z };

  return (
    <div ref={ref} style={style} className="absolute rounded-2xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur">
      <div onMouseDown={onMouseDownHeader} className="h-10 flex items-center justify-between px-3 bg-black/50 text-white cursor-move select-none">
        <div className="font-semibold truncate pr-2">{title}</div>
        <div className="flex items-center gap-2">
          <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-amber-400" title="Minimize" />
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-rose-500" title="Close" />
        </div>
      </div>
      <div className="bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 h-[calc(100%-2.5rem)] p-3 overflow-auto">
        {children}
      </div>
      {/* Resize handles */}
      <div onMouseDown={(e) => startResize("se", e)} className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize" />
      <div onMouseDown={(e) => startResize("e", e)} className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize" />
      <div onMouseDown={(e) => startResize("s", e)} className="absolute left-0 right-0 bottom-0 h-2 cursor-s-resize" />
      <div onMouseDown={(e) => startResize("nw", e)} className="absolute left-0 top-0 w-4 h-4 cursor-nw-resize" />
    </div>
  );
}

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString();
}

// ======== APPS ========
function NotesApp() {
  const [text, setText] = useState(() => localStorage.getItem("tfkos.notes") || "Welcome to TFK-OS Notes.\n\nDouble-click icons to open apps. Hit Ctrl+Space for the launcher. Your notes auto-save.");
  useEffect(() => { localStorage.setItem("tfkos.notes", text); }, [text]);
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="text-sm opacity-70">📝 Notes (persistent)</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full rounded-xl p-3 bg-white/70 dark:bg-white/10 border border-black/10 focus:outline-none"
        placeholder="Type your brilliance here…"
      />
    </div>
  );
}

function TerminalApp({ openApp }) {
  const [lines, setLines] = useState(["TFK-OS v0.1 — type 'help'", "$"]); 
  const [input, setInput] = useState("");
  const boxRef = useRef(null);

  useEffect(() => { boxRef.current?.scrollTo(0, boxRef.current.scrollHeight); }, [lines]);

  const commands = {
    help: () => [
      "help — show commands",
      "time — current time",
      "echo <text> — print",
      "apps — list apps",
      "open <app> — open app",
      "clear — clear screen",
    ],
    time: () => [new Date().toString()],
    echo: (args) => [args.join(" ")],
    apps: () => ["notes, terminal, browser, files, settings"],
    open: (args) => {
      const id = (args[0] || "").toLowerCase();
      if (["notes","terminal","browser","files","settings"].includes(id)) {
        openApp(id);
        return ["Opened " + id];
      }
      return ["Unknown app: " + id];
    },
    clear: () => { setLines(["TFK-OS v0.1 — type 'help'"]); return []; },
  };

  function run(cmd) {
    const [name, ...args] = cmd.trim().split(/\s+/);
    if (!name) return;
    const fn = commands[name];
    if (!fn) return setLines((ls) => [...ls, "$ " + cmd, `Unknown command: ${name}`]);
    const out = fn(args) || [];
    setLines((ls) => [...ls, "$ " + cmd, ...out, "$"]);
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={boxRef} className="flex-1 font-mono text-sm bg-black text-green-400 rounded-xl p-3 overflow-auto">
        {lines.map((ln, i) => (
          <div key={i}>{ln}</div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }}
        className="mt-2 flex gap-2"
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white" placeholder="Type a command…" />
        <button className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white">Run</button>
      </form>
    </div>
  );
}

function MiniBrowserApp() {
  const [url, setUrl] = useState("https://example.com");
  const [current, setCurrent] = useState("https://example.com");

  function normalize(u) {
    try {
      if (!/^https?:\/\//i.test(u)) return new URL("https://" + u).toString();
      return new URL(u).toString();
    } catch (e) {
      return "https://duckduckgo.com/?q=" + encodeURIComponent(u);
    }
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <form onSubmit={(e) => { e.preventDefault(); setCurrent(normalize(url)); }} className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-black/10" placeholder="Enter URL or search…" />
        <button className="px-3 py-2 rounded-xl bg-black/10 dark:bg-white/10">Go</button>
      </form>
      <div className="flex-1 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
        <iframe title="mini" src={current} className="w-full h-full bg-white" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" />
      </div>
      <div className="text-xs opacity-60">Note: Some sites block iframes; if a page won’t load, try another URL.</div>
    </div>
  );
}

function FilesApp() {
  const initial = useMemo(() => ([
    { type: "folder", name: "Projects" },
    { type: "folder", name: "Downloads" },
    { type: "file", name: "readme.txt", content: "TFK-OS files are mock data. Plug in a backend or IndexedDB to persist real files." },
  ]), []);
  const [cwd, setCwd] = useState(["/"]); // breadcrumb
  const [items, setItems] = useState(initial);
  const [preview, setPreview] = useState(null);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="text-sm opacity-70">Path: {cwd.join("")}</div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {items.map((it, i) => (
          <button key={i} onClick={() => setPreview(it)} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/70 dark:bg-white/10 border border-black/10 hover:scale-[1.01] transition">
            <div className="text-3xl">{it.type === "folder" ? "📁" : "📄"}</div>
            <div className="text-xs truncate w-full text-center">{it.name}</div>
          </button>
        ))}
      </div>
      {preview && (
        <div className="mt-2 p-3 rounded-xl bg-white/70 dark:bg-white/10 border border-black/10">
          <div className="font-semibold mb-1">Preview: {preview.name}</div>
          {preview.type === "file" ? (
            <pre className="whitespace-pre-wrap text-sm opacity-80">{preview.content || "(empty)"}</pre>
          ) : (
            <div className="text-sm opacity-70">Folder (no nested demo yet)</div>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsApp({ theme, setTheme, wallpaper, setWallpaper }) {
  const walls = [
    { id: "nebula", name: "Nebula" },
    { id: "ocean", name: "Ocean" },
    { id: "sunset", name: "Sunset" },
    { id: "steel", name: "Steel" },
  ];
  return (
    <div className="h-full flex flex-col gap-4">
      <section>
        <div className="text-sm opacity-70 mb-2">Appearance</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-3 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-black/10">
            Toggle Theme ({theme})
          </button>
          <div className="flex items-center gap-2">
            {walls.map((w) => (
              <button key={w.id} onClick={() => setWallpaper(w.id)} className={`px-3 py-2 rounded-xl border ${wallpaper === w.id ? "border-emerald-400" : "border-black/10 dark:border-white/10"}`}>
                {w.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="text-sm opacity-70 mb-1">About</div>
        <div className="text-sm opacity-80">TFK-OS v0.1 — Browser-native desktop. Built with React + Tailwind. You can add apps by registering them in the registry.</div>
      </section>
    </div>
  );
}
