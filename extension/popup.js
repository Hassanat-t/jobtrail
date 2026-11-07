// The popup: connect once with an API token, then save the job on the current tab.
import { parseJobPage } from "./parse.js";

const $ = (selector) => document.querySelector(selector);
const views = ["#setup", "#save", "#done"];
const STATUS_LABELS = { saved: "Saved", applied: "Applied", interview: "Interview", offer: "Offer", rejected: "Rejected" };

function show(view, statusText = "") {
  for (const v of views) $(v).hidden = v !== view;
  $("#disconnect").hidden = view === "#setup";
  $("#status").hidden = !statusText;
  $("#status").textContent = statusText;
}

function showError(form, message) {
  const el = form.querySelector(".error");
  el.textContent = message;
  el.hidden = !message;
}

// ---- Settings, kept in the extension's own storage ----
const getSettings = () => chrome.storage.local.get(["appUrl", "token"]);
const saveSettings = (settings) => chrome.storage.local.set(settings);
const clearToken = () => chrome.storage.local.remove("token");

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/** Calls the JobTrail API with the saved token. Throws ApiError with a message fit to show. */
async function api({ appUrl, token }, path, init = {}) {
  let response;
  try {
    response = await fetch(new URL(path, appUrl), {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(`Can't reach JobTrail at ${appUrl}. Check the address and that the app is running.`, 0);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.error ?? `JobTrail answered with an error (${response.status}).`, response.status);
  return body;
}

// ---- Reading the current tab ----
async function readCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  try {
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: parseJobPage });
    return result;
  } catch {
    // Chrome's own pages and the Web Store can't be read. Start from the tab's link and title.
    const url = /^https?:/.test(tab.url ?? "") ? tab.url : "";
    return { title: tab.title ?? "", company: "", location: "", salary: "", url, source: "other" };
  }
}

function fillForm(form, job) {
  for (const [name, value] of Object.entries(job)) {
    const field = form.elements.namedItem(name);
    if (field && value) field.value = value;
  }
}

const jobLink = (appUrl, id) => new URL(`/dashboard/jobs/${id}`, appUrl).toString();
const openTab = (url) => chrome.tabs.create({ url });

// ---- Screens ----
async function showSetup(message = "") {
  const settings = await getSettings();
  const form = $("#setup-form");
  if (settings.appUrl) form.elements.appUrl.value = settings.appUrl;
  showError(form, message);
  show("#setup");
  form.elements.token.focus();
}

async function showSave(settings, me) {
  $("#signed-in").textContent = `Signed in as ${me.name}`;
  show("#save", "Reading this page…");

  const form = $("#save-form");
  const job = await readCurrentTab();
  if (job) fillForm(form, job);
  $("#status").hidden = true;
  (form.elements.company.value ? form.elements.title : form.elements.company).focus();

  if (job?.url) {
    try {
      const { application } = await api(settings, `/api/applications?url=${encodeURIComponent(job.url)}`);
      if (application) showAlreadySaved(settings, application);
    } catch {
      // Not knowing about duplicates shouldn't stop the user saving.
    }
  }
}

function showAlreadySaved(settings, application) {
  const el = $("#already");
  const status = STATUS_LABELS[application.status] ?? application.status;
  el.replaceChildren(`Already on your board under ${status}. `);
  const link = document.createElement("a");
  link.href = jobLink(settings.appUrl, application.id);
  link.textContent = "Open it";
  link.addEventListener("click", (e) => {
    e.preventDefault();
    openTab(link.href);
  });
  el.append(link);
  el.hidden = false;
}

function showDone(settings, id, job) {
  $("#done-text").textContent = `${job.title} at ${job.company} is on your board.`;
  $("#open-job").onclick = () => openTab(jobLink(settings.appUrl, id));
  show("#done");
  $("#open-job").focus();
}

// ---- Events ----
$("#setup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = form.querySelector("button");
  const settings = {
    appUrl: form.elements.appUrl.value.trim().replace(/\/+$/, ""),
    token: form.elements.token.value.trim(),
  };
  button.disabled = true;
  showError(form, "");
  try {
    const me = await api(settings, "/api/me");
    await saveSettings(settings);
    form.reset();
    await showSave(settings, me);
  } catch (err) {
    showError(form, err.status === 401 ? "That token didn't work. Copy it again from Settings." : err.message);
  } finally {
    button.disabled = false;
  }
});

$("#save-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = form.querySelector("button");
  const settings = await getSettings();
  const job = Object.fromEntries(new FormData(form));
  button.disabled = true;
  button.textContent = "Saving…";
  showError(form, "");
  try {
    const { id } = await api(settings, "/api/applications", { method: "POST", body: JSON.stringify(job) });
    showDone(settings, id, job);
  } catch (err) {
    if (err.status === 401) {
      await clearToken();
      return showSetup("Your token stopped working. Create a new one in Settings.");
    }
    showError(form, err.message);
  } finally {
    button.disabled = false;
    button.textContent = "Save to JobTrail";
  }
});

$("#disconnect").addEventListener("click", async () => {
  await clearToken();
  showSetup();
});

// ---- Start ----
async function start() {
  const settings = await getSettings();
  if (!settings.token) return showSetup();
  try {
    showSave(settings, await api(settings, "/api/me"));
  } catch (err) {
    if (err.status === 401) await clearToken();
    showSetup(err.status === 401 ? "Your token stopped working. Create a new one in Settings." : err.message);
  }
}

start();
