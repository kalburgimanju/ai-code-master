(function () {
  "use strict";

  var CFG = (window.EDC_CONFIG && typeof window.EDC_CONFIG === "object")
    ? window.EDC_CONFIG
    : {};
  var COUPON = (CFG.coupons && typeof CFG.coupons === "object")
    ? CFG.coupons
    : { default: "AI_JULY_26" };
  var couponFor = function (key) {
    return COUPON[key] || COUPON.default || "";
  };
  var YT = (CFG.youtubeId || "").trim();

  var BASE = {
    builder: "https://www.udemy.com/course/ai-builder-with-n8n-create-agents-voice-agents/",
    aicoder: "https://www.udemy.com/course/ai-coder-from-vibe-coder-to-agentic-engineer/",
    leader: "https://www.udemy.com/course/executive-briefing-generative-ai-and-large-language-models-llm/",
    core: "https://www.udemy.com/course/llm-engineering-master-ai-and-large-language-models/",
    agentic: "https://www.udemy.com/course/the-complete-agentic-ai-engineering-course/",
    production: "https://www.udemy.com/course/generative-and-agentic-ai-in-production/"
  };

  var enrollUrl = function (key) {
    return BASE[key] + "?couponCode=" + couponFor(key);
  };

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  var root = document.querySelector(".edc-roadmap");
  if (!root) return;

  // Full bleed: make roadmap span full viewport width
  var fbRaf = 0;
  var fullBleed = function () {
    root.style.transform = "none";
    root.style.width = "100%";
    root.style.marginLeft = "0";
    root.style.marginRight = "0";
    var cw = document.documentElement.clientWidth;
    var natLeft = root.getBoundingClientRect().left;
    root.style.width = cw + "px";
    root.style.maxWidth = "none";
    root.style.transform = "translateX(" + (-natLeft) + "px)";
  };

  var closeTopGap = function () {
    var prev = root.previousElementSibling,
      contentAbove = false;
    while (prev) {
      if (prev.getBoundingClientRect().height > 0) {
        contentAbove = true;
        break;
      }
      prev = prev.previousElementSibling;
    }
    root.style.marginTop = "0px";
    var header =
      document.querySelector("header.wp-block-template-part") ||
      document.querySelector("header");
    var inFlow =
      header && /^(static|relative)$/.test(getComputedStyle(header).position);
    if (contentAbove || !inFlow) {
      root.style.marginTop = "";
      return;
    }
    var gap = root.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    root.style.marginTop =
      gap > 1 && gap < 240 ? -gap + "px" : "";
  };

  var relayout = function () {
    fbRaf = 0;
    fullBleed();
    closeTopGap();
  };

  var scheduleRelayout = function () {
    if (!fbRaf) fbRaf = requestAnimationFrame(relayout);
  };

  try {
    relayout();
  } finally {
    root.style.visibility = "visible";
  }
  window.addEventListener("resize", scheduleRelayout, { passive: true });
  window.addEventListener("load", relayout);

  // Intersection Observer for reveal animations
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(function () {
    root.classList.add("loaded");
  });

  var items = Array.from(root.querySelectorAll("[data-reveal]"));
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (m) {
      m.classList.add("in");
    });
  } else {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (m) {
      obs.observe(m);
    });

    setTimeout(function () {
      items.forEach(function (m) {
        if (!m.classList.contains("in")) m.classList.add("in");
      });
    }, 2500);
  }

  // Destination reveal
  var dest = root.querySelector("[data-dest]");
  if (dest) {
    if (reduce || !("IntersectionObserver" in window)) {
      dest.classList.add("in");
    } else {
      var dObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              dObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      dObs.observe(dest);
    }
  }

  // Progress rail
  var plan = root.querySelector("[data-plan]");
  var rail = root.querySelector(".edc-rail");
  if (plan && rail) {
    if (reduce) {
      rail.style.setProperty("--progress", "1");
    } else {
      var ticking = false;
      var updateProgress = function () {
        ticking = false;
        var r = plan.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var anchor = vh * 0.5;
        var raw = (anchor - r.top) / r.height;
        var p = Math.max(0, Math.min(1, raw));
        rail.style.setProperty("--progress", p.toFixed(4));
      };
      var onScroll = function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateProgress);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }
  }

  // Choice buttons
  var choices = root.querySelectorAll(".edc-choice");
  choices.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pressed = this.getAttribute("aria-pressed") === "true";
      choices.forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      if (!pressed) {
        this.setAttribute("aria-pressed", "true");
      }
    });
  });

  // Detail toggle buttons
  var toggleBtns = root.querySelectorAll("[data-toggle]");
  toggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panelId = this.getAttribute("aria-controls");
      var panel = document.getElementById(panelId);
      var expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !expanded);
      if (panel) {
        panel.style.display = expanded ? "none" : "block";
      }
    });
  });

  // Video play button (placeholder - would open modal in full implementation)
  var vplay = root.querySelector(".vplay");
  if (vplay) {
    vplay.addEventListener("click", function () {
      // In a full implementation, this would open a video modal
      // For now, we'll just log it
      console.log("Play video:", YT);
    });
  }
})();
