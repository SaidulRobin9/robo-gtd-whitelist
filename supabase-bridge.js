(function () {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const DEVICE_ID_KEY = "robo_gtd_device_id";
  const REFERRAL_CODE_KEY = "robo_gtd_referral_code";
  const SUBMISSION_KEY = "robo_gtd_submission_complete";
  const QUOTE_TWEET_URL =
    "https://x.com/therobowtf/status/2094835376913559983?s=20";

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key) || "";
    } catch (error) {
      return "";
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Browser storage is unavailable.", error);
    }
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + window.crypto.randomUUID().replace(/-/g, "");
    }
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2)
    );
  }

  function getDeviceId() {
    const existing = readStorage(DEVICE_ID_KEY);
    if (existing) return existing;
    const value = createId("device_");
    writeStorage(DEVICE_ID_KEY, value);
    return value;
  }

  function getReferralCode() {
    const existing = readStorage(REFERRAL_CODE_KEY);
    if (existing) return existing;
    const value = createId("robo_").slice(-12);
    writeStorage(REFERRAL_CODE_KEY, value);
    return value;
  }

  function getReferralUrl() {
    return (
      window.location.origin +
      window.location.pathname +
      "?ref=" +
      encodeURIComponent(getReferralCode())
    );
  }

  function getIncomingReferralCode() {
    return new URLSearchParams(window.location.search).get("ref") || "";
  }

  function isSubmissionComplete() {
    return readStorage(SUBMISSION_KEY) === "1";
  }

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

  function setRegistrationMessage(message, isError) {
    const panel = document.querySelector("[data-robo-referral-panel]");
    if (!panel) return;
    const messageNode = panel.querySelector("[data-robo-referral-message]");
    if (!messageNode) return;
    messageNode.textContent = message;
    messageNode.style.color = isError ? "#e91e63" : "#17202a";
  }

  function injectReferralPanel() {
    const submitButton = document.querySelector(
      '[data-testid="button-submit-tasks"]',
    );
    if (!submitButton) return false;

    const card = submitButton.closest(".card-ink");
    if (!card || card.querySelector("[data-robo-referral-panel]")) return true;

    const referralUrl = getReferralUrl();
    const quoteText =
      "I have entered for Robo GTD! Here is my referral link to join: " +
      referralUrl;
    const panel = document.createElement("div");
    panel.setAttribute("data-robo-referral-panel", "true");
    panel.style.cssText =
      "display:flex;flex-direction:column;gap:10px;padding:14px;margin-top:2px;border:3px dashed rgba(23,32,42,.35);border-radius:14px;background:#f7f8f1";
    panel.innerHTML =
      '<div style="font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#17202a">Required: unique quote tweet</div>' +
      '<div style="font-size:13px;line-height:1.5;color:#414141">Quote tweet the latest Robo post, include your unique referral link, then confirm below before submitting.</div>' +
      '<div style="display:flex;gap:8px;align-items:stretch;flex-wrap:wrap">' +
      '<input aria-label="Your unique referral link" readonly value="' +
      referralUrl.replace(/"/g, "&quot;") +
      '" style="flex:1;min-width:210px;border:2px solid #17202a;border-radius:9px;padding:9px;background:white;font-size:12px;font-weight:700;color:#17202a">' +
      '<button type="button" data-robo-copy style="border:2px solid #17202a;border-radius:9px;padding:9px 12px;background:#7cf303;color:#17202a;font-weight:900;cursor:pointer">Copy link</button>' +
      "</div>" +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<button type="button" data-robo-open-x style="border:2px solid #17202a;border-radius:9px;padding:10px 12px;background:#ff3b8d;color:white;font-weight:900;cursor:pointer">Open post on X</button>' +
      '<button type="button" data-robo-copy-text style="border:2px solid #17202a;border-radius:9px;padding:10px 12px;background:white;color:#17202a;font-weight:900;cursor:pointer">Copy quote text</button>' +
      "</div>" +
      '<label style="display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.4;font-weight:700;color:#17202a;cursor:pointer">' +
      '<input type="checkbox" data-robo-quote-confirm style="margin-top:2px;width:16px;height:16px;accent-color:#ff3b8d">' +
      "<span>I created the quote tweet with this referral link.</span>" +
      "</label>" +
      '<div data-robo-referral-message style="min-height:16px;font-size:12px;font-weight:800;color:#17202a">X actions are not verified automatically.</div>';

    const copyValue = function (value, label) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(value)
          .then(function () {
            setRegistrationMessage(label + " copied.", false);
          })
          .catch(function () {
            setRegistrationMessage("Copy failed — select the text manually.", true);
          });
      } else {
        setRegistrationMessage("Copy is unavailable — select the text manually.", true);
      }
    };

    panel.querySelector("[data-robo-copy]").addEventListener("click", function () {
      copyValue(referralUrl, "Referral link");
    });
    panel
      .querySelector("[data-robo-copy-text]")
      .addEventListener("click", function () {
        copyValue(quoteText, "Quote text");
      });
    panel
      .querySelector("[data-robo-open-x]")
      .addEventListener("click", function () {
        window.open(QUOTE_TWEET_URL, "_blank", "noopener,noreferrer");
      });

    card.insertBefore(panel, submitButton);
    if (isSubmissionComplete()) {
      setRegistrationMessage(
        "This browser has already submitted a registration.",
        true,
      );
    }
    return true;
  }

  function watchForRegistrationForm() {
    if (injectReferralPanel()) return;
    const observer = new MutationObserver(function () {
      if (injectReferralPanel()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  document.addEventListener(
    "click",
    function (event) {
      const submitButton =
        event.target && event.target.closest
          ? event.target.closest('[data-testid="button-submit-tasks"]')
          : null;
      if (!submitButton) return;

      if (isSubmissionComplete()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setRegistrationMessage(
          "This browser has already submitted a registration.",
          true,
        );
        return;
      }

      const confirmation = document.querySelector(
        "[data-robo-quote-confirm]",
      );
      if (!confirmation || !confirmation.checked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setRegistrationMessage(
          "Please create the quote tweet and check the confirmation box first.",
          true,
        );
      }
    },
    true,
  );

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
          device_id: getDeviceId(),
          referral_code: getReferralCode(),
          referral_url: getReferralUrl(),
          referred_by: getIncomingReferralCode() || null,
          quote_tweet_confirmed: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Supabase rejected the registration: " + response.status);
    }
    writeStorage(SUBMISSION_KEY, "1");
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
      return originalFetch(input, init).then(function (response) {
        writeStorage(SUBMISSION_KEY, "1");
        return response;
      });
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
  watchForRegistrationForm();
})();