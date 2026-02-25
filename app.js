(() => {
  const routes = {
    "/": {
      path: "/",
      title: "Stop Missing The Right Jobs.",
      subtitle: "Precision-matched job discovery delivered daily at 9AM.",
      ctaLabel: "Start Tracking",
      ctaTo: "/settings",
      section: "landing",
    },
    "/dashboard": {
      path: "/dashboard",
      title: "Dashboard",
      subtitle: "No jobs yet. In the next step, you will load a realistic dataset.",
      section: "dashboard",
    },
    "/saved": {
      path: "/saved",
      title: "Saved",
      subtitle: "Jobs you save for later will appear here in the next step.",
      section: "saved",
    },
    "/digest": {
      path: "/digest",
      title: "Digest",
      subtitle: "A calm daily summary of your most relevant roles will be introduced here in the next step.",
      section: "digest",
    },
    "/settings": {
      path: "/settings",
      title: "Settings",
      subtitle: "Define your preferences so JobRadar knows what to track.",
      section: "settings",
    },
    "/proof": {
      path: "/proof",
      title: "Proof",
      subtitle: "This page will later collect artifacts that show the system working end to end.",
      section: "proof",
    },
  };

  const notFoundRoute = {
    path: null,
    title: "Page Not Found",
    subtitle: "The page you are looking for does not exist.",
    isNotFound: true,
  };

  function getInitialPath() {
    const { pathname } = window.location;
    // When opened directly via file://, always show the landing page.
    if (window.location.protocol === "file:") {
      return "/";
    }
    // For real HTTP routes, let unknown paths fall through to 404.
    return routes[pathname] ? pathname : pathname;
  }

  function findRoute(path) {
    if (routes[path]) {
      return routes[path];
    }
    return notFoundRoute;
  }

  function renderRoute(route) {
    const pageTitleEl = document.getElementById("jr-page-title");
    const pageSubtitleEl = document.getElementById("jr-page-subtitle");
    const routeHeadingEl = document.getElementById("jr-route-heading");
    const routeSubtextEl = document.getElementById("jr-route-subtext");
    const navLinks = document.querySelectorAll(".jr-nav__link");
    const ctaButton = document.getElementById("jr-route-cta");
    const settingsSection = document.getElementById("jr-settings-section");
    const dashboardEmpty = document.getElementById("jr-dashboard-empty");
    const savedEmpty = document.getElementById("jr-saved-empty");
    const digestEmpty = document.getElementById("jr-digest-empty");
    const proofPlaceholder = document.getElementById("jr-proof-placeholder");

    if (
      !pageTitleEl ||
      !pageSubtitleEl ||
      !routeHeadingEl ||
      !routeSubtextEl
    ) {
      return;
    }

    pageTitleEl.textContent = route.title;
    pageSubtitleEl.textContent = route.subtitle;
    routeHeadingEl.textContent = route.title;
    routeSubtextEl.textContent = route.subtitle;

    if (ctaButton) {
      if (route.ctaLabel && route.ctaTo && route.section === "landing") {
        ctaButton.textContent = route.ctaLabel;
        ctaButton.dataset.targetRoute = route.ctaTo;
        ctaButton.hidden = false;
        ctaButton.style.display = "";
      } else {
        ctaButton.hidden = true;
        ctaButton.style.display = "none";
        delete ctaButton.dataset.targetRoute;
      }
    }

    if (settingsSection) {
      settingsSection.hidden = route.section !== "settings";
    }
    if (dashboardEmpty) {
      dashboardEmpty.hidden = route.section !== "dashboard";
    }
    if (savedEmpty) {
      savedEmpty.hidden = route.section !== "saved";
    }
    if (digestEmpty) {
      digestEmpty.hidden = route.section !== "digest";
    }
    if (proofPlaceholder) {
      proofPlaceholder.hidden = route.section !== "proof";
    }

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("data-route");
      if (!route.isNotFound && linkPath === route.path) {
        link.classList.add("jr-nav__link--active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("jr-nav__link--active");
        link.removeAttribute("aria-current");
      }
    });
  }

  let currentRoutePath = null;

  function navigate(path, options = {}) {
    const { replace = false } = options;
    const route = findRoute(path);

    if (!route.isNotFound && route.path === currentRoutePath && !replace) {
      closeMobileNav();
      return;
    }

    const statePath = route.isNotFound ? path : route.path;
    const method = replace ? "replaceState" : "pushState";

    if (window.history && window.history[method]) {
      try {
        window.history[method](
          { routePath: route.path || path },
          "",
          statePath || path
        );
      } catch (error) {
        // Some environments (e.g. file://) may not allow pushState with these URLs.
        // In that case, we still render the route without modifying the URL.
      }
    }

    renderRoute(route);
    currentRoutePath = route.path || path;
    closeMobileNav();
  }

  function closeMobileNav() {
    const toggle = document.querySelector(".jr-nav__toggle");
    const links = document.querySelector(".jr-nav__links");
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("jr-nav__links--open");
  }

  function setupNavigation() {
    const navLinks = document.querySelectorAll(".jr-nav__link");
    const toggle = document.querySelector(".jr-nav__toggle");
    const links = document.querySelector(".jr-nav__links");
    const ctaButton = document.getElementById("jr-route-cta");

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const path = link.getAttribute("data-route");
        navigate(path);
      });
    });

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        links.classList.toggle("jr-nav__links--open", !expanded);
      });
    }

    if (ctaButton) {
      ctaButton.addEventListener("click", () => {
        const target = ctaButton.dataset.targetRoute;
        if (target) {
          navigate(target);
        }
      });
    }
  }

  window.addEventListener("popstate", (event) => {
    const state = event.state;
    if (state && state.routePath && routes[state.routePath]) {
      renderRoute(routes[state.routePath]);
      return;
    }
    const fallbackPath = getInitialPath();
    renderRoute(findRoute(fallbackPath));
  });

  window.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    const initialPath = getInitialPath();
    const initialRoute = findRoute(initialPath);
    navigate(initialRoute.path, { replace: true });
  });
})();
