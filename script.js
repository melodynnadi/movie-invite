const screens = [...document.querySelectorAll(".screen")];
const app = document.querySelector(".app");
const dots = [...document.querySelectorAll(".dot")];
const nextButtons = [...document.querySelectorAll("[data-next]")];
const dateTimeInput = document.querySelector("#dateTime");
const messageText = document.querySelector("#messageText");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const statusText = document.querySelector("#statusText");
const copyButton = document.querySelector("#copyButton");
const calendarButton = document.querySelector("#calendarButton");
const confetti = document.querySelector("#confetti");

const noLines = [
  "No tried to leave, but the apology was too sincere.",
  "It moved because even it knows tonight deserves a redo.",
  "Counteroffer: yes, but you get to roast me once.",
  "No is now reviewing its life choices.",
  "Final answer unlocked: yes."
];

let activeScreen = 0;
let noAttempts = 0;

function pad(value) {
  return String(value).padStart(2, "0");
}

function showScreen(index) {
  activeScreen = Math.max(0, Math.min(index, screens.length - 1));
  screens.forEach((screen, screenIndex) => {
    screen.classList.toggle("is-active", screenIndex === activeScreen);
  });
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeScreen);
  });
}

function defaultDateTime() {
  const now = new Date();
  const date = new Date(now);
  date.setHours(22, 30, 0, 0);
  if (now.getHours() >= 23) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function toInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function selectedDate() {
  return dateTimeInput.value ? new Date(dateTimeInput.value) : defaultDateTime();
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function buildMessage() {
  const when = formatDate(selectedDate());
  return `Toni Stark, I'm sorry I fell asleep before our movie last night. Can I make it up tonight with FaceTime and Jojo Rabbit? I'll call you at ${when}, fully awake and ready to watch the movie with you.`;
}

function updateMessage() {
  messageText.value = buildMessage();
}

function moveNoButton() {
  noAttempts += 1;
  const maxX = Math.max(12, window.innerWidth - noButton.offsetWidth - 16);
  const maxY = Math.max(64, window.innerHeight - noButton.offsetHeight - 24);
  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(58 + Math.random() * (maxY - 58));
  const scale = Math.max(0.58, 1 - noAttempts * 0.08);

  noButton.classList.add("is-running");
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
  noButton.style.transform = `scale(${scale}) rotate(${noAttempts % 2 ? -5 : 5}deg)`;
  statusText.textContent = noLines[Math.min(noAttempts - 1, noLines.length - 1)];

  if (noAttempts >= noLines.length) {
    noButton.classList.remove("secondary", "no");
    noButton.classList.add("primary");
    noButton.textContent = "Fine... yes";
  }
}

function celebrate() {
  updateMessage();
  showScreen(4);

  for (let i = 0; i < 56; i += 1) {
    const piece = document.createElement("i");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = ["#ff6f91", "#ffc857", "#57c7b6", "#fff7ec"][i % 4];
    piece.style.animationDelay = `${Math.random() * 320}ms`;
    piece.style.animationDuration = `${900 + Math.random() * 850}ms`;
    confetti.appendChild(piece);
    setTimeout(() => piece.remove(), 2200);
  }
}

async function copyInvite() {
  updateMessage();
  try {
    await navigator.clipboard.writeText(messageText.value);
    copyButton.textContent = "Copied";
  } catch (error) {
    messageText.focus();
    messageText.select();
    document.execCommand("copy");
    copyButton.textContent = "Selected";
  }
  setTimeout(() => {
    copyButton.textContent = "Copy text";
  }, 1300);
}

function toIcsDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadReminder() {
  const start = selectedDate();
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = toIcsDate(new Date());
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Movie Date Apology//Invite//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@movie-date`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    "SUMMARY:FaceTime movie date: Jojo Rabbit",
    "DESCRIPTION:Make-up movie date with FaceTime, Jojo Rabbit, and one sincere apology.",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Movie date starts soon",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "toni-movie-date-reminder.ics";
  link.click();
  URL.revokeObjectURL(url);
}

dateTimeInput.value = toInputValue(defaultDateTime());
updateMessage();
const requestedScreen = Number(new URLSearchParams(window.location.search).get("screen"));
showScreen(Number.isFinite(requestedScreen) ? requestedScreen : 0);
requestAnimationFrame(() => app.classList.add("is-ready"));

nextButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(activeScreen + 1));
});

dateTimeInput.addEventListener("change", updateMessage);
yesButton.addEventListener("click", celebrate);
noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("click", () => {
  if (noAttempts >= noLines.length) {
    celebrate();
  } else {
    moveNoButton();
  }
});
copyButton.addEventListener("click", copyInvite);
calendarButton.addEventListener("click", downloadReminder);
