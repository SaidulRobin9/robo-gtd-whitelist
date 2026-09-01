(function () {
  "use strict";

  const originalFetch = window.fetch.bind(window);

  function getConfig() {
    const config = window.ROBO_SUPABASE_CONFIG || {};
    return {
      url: String(config.url || "").replace(/\/+$/, ""),
      anonKey: String(config.anonKey || ""),
    };
  }

  function replaceAnnouncementHeading() {
    if (!document.body) return false;
    const oldText = /The Robo GTD announcement is live\s*—/;
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    let node;
    while ((node = walker.nextNode())) {
      if (oldText.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(
          oldText,
          "ROBO WHITELIST REGISTRATION IS NOW OPEN!",
        );
        return true;
      }
    }
    return false;
  }

  function watchForAnnouncementHeading() {
    if (replaceAnnouncementHeading()) return;
    const observer = new MutationObserver(function () {
      if (replaceAnnouncementHeading()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  async function saveRegistration(payload) {
    const config = getConfig();
    if (!config.url || !config.anonKey) {
      return false;
    }

    const response = await originalFetch(
      config.url + "/rest/v1/whitelist_registrations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.anonKey,
          Authorization: "Bearer " + config.anonKey,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          submitted_at: payload.submittedAt || new Date().toISOString(),
          username: payload.username || payload.handle || "",
          wallet_address: payload.walletAddress || payload.address || "",
          tasks_completed: Array.isArray(payload.tasksCompleted)
            ? payload.tasksCompleted
            : [],
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Supabase rejected the registration: " + response.status);
    }
    return true;
  }

  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input && input.url;
    const isRegistration =
      typeof url === "string" &&
      url.includes("script.google.com/macros") &&
      init &&
      init.method === "POST";

    if (!isRegistration) {
      return originalFetch(input, init);
    }

    const config = getConfig();
    if (!config.url || !config.anonKey) {
      return originalFetch(input, init);
    }

    let payload = {};
    try {
      payload = JSON.parse(init.body || "{}");
    } catch (error) {
      console.error("Could not parse the registration payload.", error);
    }

    return saveRegistration(payload).then(function () {
      return new Response(null, { status: 204 });
    });
  };

  watchForAnnouncementHeading();
})();