/* =========================================================
   HAPPY MONTHSARY — behaviour
   ========================================================= */
(() => {
  "use strict";

  const C = window.LOVE_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const pad = (n) => String(n).padStart(2, "0");

  /* ------------------------------------------------- dates */
  const start = (() => {
    const d = new Date(C.startDate || "2021-01-01");
    return isNaN(d) ? new Date() : d;
  })();
  start.setHours(0, 0, 0, 0);

  const now = new Date();

  const monthsTogether = () => {
    let m = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) m -= 1;
    return Math.max(m, 0);
  };

  const nextMonthsary = () => {
    const day = start.getDate();
    const build = (y, mo) => {
      const last = new Date(y, mo + 1, 0).getDate();
      return new Date(y, mo, Math.min(day, last), 0, 0, 0, 0);
    };
    let d = build(now.getFullYear(), now.getMonth());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d < today) d = build(now.getFullYear(), now.getMonth() + 1);
    return d;
  };

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const autoMonth = monthsTogether() + 1;
  const monthCount =
    C.monthsaryNumber != null && isFinite(+C.monthsaryNumber)
      ? Math.max(1, Math.round(+C.monthsaryNumber)) // the one you set in config.js
      : autoMonth;                                   // or counted from startDate
  const dayMs = 86400000;
  const daysTogether = Math.max(1, Math.floor((new Date() - start) / dayMs));
  const hoursTogether = daysTogether * 24;
  const addOneMonth = (d) => {
    const day = start.getDate();
    const t = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    return new Date(t.getFullYear(), t.getMonth(), Math.min(day, last));
  };
  let nm = nextMonthsary();
  // if the anniversary date is basically today, "the next one" means next month
  if (nm - new Date() < 3 * dayMs) nm = addOneMonth(nm);

  /* ------------------------------------------------- fill text */
  $("intro-name").textContent = C.herName || "Baby";
  $("dear-name").textContent = C.herName || "Baby";
  $("title-a").textContent = C.letterTitle || "Happy Monthsary,";
  $("title-b").textContent = C.letterTitleAccent || "my love";
  $("signature").textContent = C.yourName || "Me";
  $("closing-line").textContent = C.letterClosing || "Forever yours,";
  $("finale-sign").textContent = "— " + (C.yourName || "Me");
  $("month-count").textContent = ordinal(monthCount);
  $("reasons-title").textContent = C.reasonsTitle || "Reasons";
  $("photo-caption").textContent = C.photoCaption || "";
  $("track-name").textContent = C.songTitle || "Our Song";
  $("track-artist").textContent = C.songArtist || "now playing for you";

  const fmt = (d, opts) =>
    d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric", ...opts });

  $("hero-date").textContent = fmt(start, { day: "numeric", month: "long", year: "numeric" });
  $("hero-days").textContent = `${ordinal(monthCount)} monthsary`;
  $("letter-date-line").textContent = fmt(new Date());
  $("letter-no").textContent = monthCount;
  $("cd-note").textContent =
    `same date, one month closer to forever — until ${fmt(nm)}, ${(C.herName || "you")}.`;

  /* ------------------------------------------------- letter body */
  const body = $("letter-body");
  const paras = Array.isArray(C.letter) ? C.letter : [];
  paras.forEach((t) => body.appendChild(el("p", null, t)));
  if (!paras.length) body.appendChild(el("p", null, "Write your letter in <code>js/config.js</code>."));

  /* ------------------------------------------------- reasons cards
     FRONT = picture (+ label), BACK = small note */
  const grid = $("reasons-grid");
  (Array.isArray(C.reasons) ? C.reasons : []).forEach((r) => {
    const card = el("div", "card");
    const inner = el("div", "card-inner");

    const front = el("div", "card-face card-front");
    const shot = el("div", "card-shot");
    const img = el("img");
    img.alt = r.label || r.front || "";
    img.loading = "lazy";
    const art = el("div", "card-art", "♥");
    const src = r.img || r.frontImg || "";
    img.onerror = () => shot.classList.add("no-img"); // soft heart instead of a broken icon
    if (src) img.src = src;
    else shot.classList.add("no-img");
    shot.append(art, img);

    const cap = el("div", "card-cap", r.label || r.front || "");
    cap.appendChild(el("small", "card-tap", "tap me ♥"));
    front.append(shot, cap);

    const back = el("div", "card-face card-back", r.back || r.note || "");
    inner.append(front, back);
    card.appendChild(inner);
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      burstAt(card.getBoundingClientRect(), 5);
    });
    grid.appendChild(card);
  });

  /* ------------------------------------------------- secret notes */
  const field = $("secret-field");
  (Array.isArray(C.secretNotes) ? C.secretNotes : []).forEach((note, i) => {
    const b = el("button", "note-heart", "♥");
    b.type = "button";
    b.style.animationDelay = `${i * 0.35}s`;
    b.addEventListener("click", () => {
      if (b.classList.contains("used")) return;
      b.classList.add("used");
      const rect = b.getBoundingClientRect();
      const fRect = field.getBoundingClientRect();
      const bubble = el("div", "note-bubble", note);
      bubble.style.left = Math.max(0, Math.min(rect.left - fRect.left - 90, fRect.width - 220)) + "px";
      bubble.style.top = rect.top - fRect.top - 74 + "px";
      field.appendChild(bubble);
      burstAt(rect, 7);
      setTimeout(() => bubble.remove(), 4200);
    });
    field.appendChild(b);
  });

  /* ------------------------------------------------- stats count-up */
  const countUp = (node, target, ms = 1600) => {
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ------------------------------------------------- countdown */
  const tickCountdown = () => {
    const diff = Math.max(0, nm - new Date());
    const d = Math.floor(diff / dayMs);
    const h = Math.floor((diff % dayMs) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    $("cd-d").textContent = pad(d);
    $("cd-h").textContent = pad(h);
    $("cd-m").textContent = pad(m);
    $("cd-s").textContent = pad(s);
  };
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ------------------------------------------------- starfield */
  const canvas = $("stars");
  const ctx = canvas.getContext("2d");
  let stars = [], shoot = null, W = 0, H = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(190, Math.round((W * H) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      sp: Math.random() * 0.014 + 0.003,
      hue: Math.random() > 0.75 ? "255,205,170" : "255,255,255",
    }));
  };
  addEventListener("resize", resize);
  resize();

  const drawStars = () => {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a += s.sp;
      const alpha = 0.28 + Math.abs(Math.sin(s.a)) * 0.72;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.hue},${alpha})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!shoot && Math.random() < 0.0022) {
      shoot = { x: Math.random() * W * 0.7 + W * 0.25, y: Math.random() * H * 0.35, len: 0 };
    }
    if (shoot) {
      shoot.len += 9; shoot.x -= 7; shoot.y += 4;
      const g = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x + 90, shoot.y - 52);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(shoot.x + 90, shoot.y - 52);
      ctx.stroke();
      if (shoot.len > 320 || shoot.x < -100) shoot = null;
    }
    requestAnimationFrame(drawStars);
  };
  drawStars();

  /* ------------------------------------------------- floating hearts */
  const sky = $("sky-layer");
  const glyphs = ["♥", "❤", "❥", "♡", "✦"];
  const spawnFloat = () => {
    const n = el("span", "float", glyphs[(Math.random() * glyphs.length) | 0]);
    n.style.left = Math.random() * 100 + "vw";
    n.style.fontSize = 11 + Math.random() * 24 + "px";
    n.style.animationDuration = 14 + Math.random() * 16 + "s";
    n.style.color = Math.random() > 0.6 ? "var(--gold)" : "var(--rose-soft)";
    sky.appendChild(n);
    setTimeout(() => n.remove(), 32000);
  };
  setInterval(spawnFloat, 1100);
  for (let i = 0; i < 8; i++) setTimeout(spawnFloat, i * 260);

  /* ------------------------------------------------- heart bursts */
  const burstAt = (rect, n = 14) => {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < n; i++) {
      const b = el("span", "burst", glyphs[(Math.random() * glyphs.length) | 0]);
      const ang = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 150;
      b.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      b.style.setProperty("--dy", Math.sin(ang) * dist - 60 + "px");
      b.style.setProperty("--rot", (Math.random() * 260 - 130).toFixed(0) + "deg");
      b.style.left = cx + "px";
      b.style.top = cy + "px";
      b.style.fontSize = 12 + Math.random() * 20 + "px";
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 1600);
    }
  };
  const rain = (n = 60) => {
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const b = el("span", "burst", glyphs[(Math.random() * glyphs.length) | 0]);
        b.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
        b.style.setProperty("--dy", -(300 + Math.random() * 480) + "px");
        b.style.setProperty("--rot", (Math.random() * 400 - 200) + "deg");
        b.style.left = Math.random() * innerWidth + "px";
        b.style.top = innerHeight * (0.75 + Math.random() * 0.25) + "px";
        b.style.fontSize = 14 + Math.random() * 26 + "px";
        b.style.color = ["#e57a8c", "#e9c39b", "#ffb3c1", "#fff"][i % 4];
        b.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
        document.body.appendChild(b);
        setTimeout(() => b.remove(), 3400);
      }, i * 32);
    }
  };

  /* ------------------------------------------------- photo */
  const img = $("photo");
  const polaroid = $("polaroid");
  const PLACEHOLDER = "assets/placeholder.svg";
  img.onerror = () => {
    if (img.dataset.fallback) polaroid.classList.add("missing");
    else { img.dataset.fallback = 1; img.src = PLACEHOLDER; }
  };
  img.src = C.photo || PLACEHOLDER;

  /* ------------------------------------------------- music (YouTube link OR local file) */
  const audio = $("audio");
  const player = $("player");
  const disc = $("disc");
  const playBtn = $("play-btn");
  const progress = $("track-progress");
  const vol = $("volume");

  const setSpin = (on) => {
    disc.classList.toggle("spin", on);
    playBtn.textContent = on ? "❚❚" : "▶";
  };

  /* is the configured song a YouTube video? */
  const ytId = (() => {
    const s = String(C.song || "");
    if (!/youtube\.com|youtu\.be/i.test(s)) return null;
    const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  })();

  let yt = null,
    ytReady = false,
    ytWants = false;

  if (ytId) {
    /* --- stream it through a near-invisible YouTube player --- */
    player.hidden = false;

    const holder = el("div", "yt-holder");
    const mount = el("div", "yt-mount");
    mount.id = "yt-song";
    holder.appendChild(mount);
    document.body.appendChild(holder);

    const boot = () => {
      yt = new window.YT.Player("yt-song", {
        videoId: ytId,
        width: 4,
        height: 4,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          playsinline: 1,
          loop: 1,
          playlist: ytId,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            ytReady = true;
            if (yt.setVolume) yt.setVolume(Math.round(+vol.value * 100));
            if (ytWants) yt.playVideo();
          },
          onStateChange: (e) => {
            const P = window.YT.PlayerState;
            if (e.data === P.PLAYING) setSpin(true);
            else if (e.data === P.PAUSED) setSpin(false);
            else if (e.data === P.ENDED) {
              yt.seekTo(0, true);
              yt.playVideo();
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) boot();
    else {
      window.onYouTubeIframeAPIReady = boot;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    setInterval(() => {
      if (!ytReady || !yt || !yt.getDuration) return;
      const d = yt.getDuration();
      if (d > 0) progress.style.width = ((yt.getCurrentTime() / d) * 100).toFixed(2) + "%";
    }, 500);
  } else {
    /* --- plain audio file from the assets folder --- */
    audio.src = C.song || "assets/song.mp3";
    audio.volume = +vol.value;

    audio.addEventListener("loadedmetadata", () => (player.hidden = false));
    audio.addEventListener("error", () => {
      player.hidden = false;
      setSpin(false);
      $("track-artist").textContent = "no song yet — but my heart keeps the beat ♥";
    });
    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
    });
    audio.addEventListener("play", () => setSpin(true));
    audio.addEventListener("pause", () => setSpin(false));
  }

  const playMusic = () => {
    if (ytId) {
      ytWants = true;
      if (ytReady && yt) yt.playVideo();
    } else audio.play().catch(() => {});
  };
  const pauseMusic = () => {
    if (ytId) {
      ytWants = false;
      if (yt) yt.pauseVideo();
    } else audio.pause();
  };
  const musicPlaying = () =>
    ytId
      ? ytReady && yt && yt.getPlayerState && yt.getPlayerState() === 1
      : !audio.paused;

  playBtn.addEventListener("click", () => (musicPlaying() ? pauseMusic() : playMusic()));
  vol.addEventListener("input", (e) => {
    const v = +e.target.value;
    if (ytId) {
      if (yt && yt.setVolume) yt.setVolume(Math.round(v * 100));
    } else audio.volume = v;
  });

  /* ------------------------------------------------- reveals */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        if (en.target.classList.contains("stats")) {
          countUp($("stat-days"), daysTogether);
          countUp($("stat-months"), monthCount, 1200);
          countUp($("stat-hours"), hoursTogether, 2000);
        }
        io.unobserve(en.target);
      });
    },
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

  /* letter paragraphs + signature reveal */
  const paraIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const p = en.target;
        const i = [...body.children].indexOf(p);
        setTimeout(() => p.classList.add("show"), i * 220);
        paraIO.unobserve(p);
      });
    },
    { threshold: 0.35 }
  );
  paras.forEach((_, i) => paraIO.observe(body.children[i]));

  const sigIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          setTimeout(() => $("signature").classList.add("write"), 700);
          sigIO.disconnect();
        }
      });
    },
    { threshold: 0.6 }
  );
  sigIO.observe($("signature"));

  /* ------------------------------------------------- open the envelope */
  const envelope = $("envelope");
  const intro = $("intro");
  const stage = $("stage");
  let opened = false;

  const open = () => {
    if (opened) return;
    opened = true;
    envelope.classList.add("open");
    $("intro-hint").textContent = "there you are ♥";

    const r = envelope.getBoundingClientRect();
    burstAt(r, 22);

    if (C.autoplay !== false) playMusic();

    setTimeout(() => {
      intro.classList.add("gone");
      stage.hidden = false;
      document.body.style.overflow = "auto";
      rain(46);
      window.scrollTo(0, 0);
      setTimeout(() => {
        stage.querySelectorAll(".reveal").forEach((n) => {
          const rect = n.getBoundingClientRect();
          if (rect.top < innerHeight * 0.92) n.classList.add("in");
        });
      }, 120);
      setTimeout(() => (intro.style.display = "none"), 1000);
    }, 1500);
  };

  envelope.addEventListener("click", open);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });

  document.body.style.overflow = "hidden";

  /* tap anywhere = hearts */
  addEventListener("click", (e) => {
    if (!opened) return;
    if (e.target.closest(".player, .card, .note-heart, .btn-reopen, a, button")) return;
    burstAt({ left: e.clientX - 9, top: e.clientY - 9, width: 18, height: 18 }, 5);
  });

  $("btn-again").addEventListener("click", () => rain(80));

  /* console help for the sender */
  console.log(
    "%c♥ Make it yours: edit js/config.js, then drop assets/photo.jpg and assets/song.mp3",
    "color:#e57a8c;font-size:13px;font-family:Georgia"
  );
})();
