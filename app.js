const state = {
  tasks: [],
  currentIndex: 0,
  remaining: 0,
  currentTotal: 0,
  timerId: null,
  lang: "ko",
};

const els = {
  taskInput: document.getElementById("taskInput"),
  hourInput: document.getElementById("hourInput"),
  minInput: document.getElementById("minInput"),
  secInput: document.getElementById("secInput"),
  addTaskBtn: document.getElementById("addTaskBtn"),
  clearListBtn: document.getElementById("clearListBtn"),
  startBtn: document.getElementById("startBtn"),
  taskList: document.getElementById("taskList"),
  setupView: document.getElementById("setupView"),
  runView: document.getElementById("runView"),
  currentTaskTitle: document.getElementById("currentTaskTitle"),
  currentIndex: document.getElementById("currentIndex"),
  timeDisplay: document.getElementById("timeDisplay"),
  stopBtn: document.getElementById("stopBtn"),
  nextBtn: document.getElementById("nextBtn"),
  queueList: document.getElementById("queueList"),
  backBtn: document.getElementById("backBtn"),
  toast: document.getElementById("toast"),
  progressBar: document.getElementById("progressBar"),
  langKo: document.getElementById("langKo"),
  langEn: document.getElementById("langEn"),
};

const i18n = {
  ko: {
    appTitle: "할 일 타이머",
    appTag: "할 일 리스트와 타이머를 한 번에",
    setupTitle: "할 일 추가",
    taskLabel: "할 일",
    taskPlaceholder: "예: 이메일 정리",
    hourLabel: "시",
    minLabel: "분",
    secLabel: "초",
    addBtn: "추가",
    listTitle: "할 일 목록",
    clearBtn: "초기화",
    startBtn: "실행하기",
    aboutTitle: "이 앱은?",
    aboutText: "할 일을 추가하고, 순서대로 타이머를 실행해 집중을 돕는 웹앱입니다.",
    termsLink: "이용약관",
    contactLink: "문의",
    privacyTitle: "개인정보 처리방침",
    privacyText:
      "이 앱은 할 일 데이터를 브라우저에만 저장하며 외부로 전송하지 않습니다. 실제 서비스용으로는 맞춤형 방침을 준비해 주세요.",
    versionLabel: "버전",
    runTitle: "진행 중",
    backBtn: "목록으로",
    currentTask: "현재 할 일",
    stopBtn: "조기 종료",
    nextBtn: "다음",
    queueTitle: "대기 중",
    overallProgress: "전체 진행도",
    toastClamped: "입력 시간이 최대값으로 자동 조정되었습니다.",
    toastEmpty: "할 일을 입력해 주세요.",
    toastAdded: "할 일이 추가되었습니다.",
    toastCleared: "목록이 초기화되었습니다.",
    toastNoTasks: "먼저 할 일을 추가해 주세요.",
    doneAll: "모든 할 일을 완료했습니다!",
  },
  en: {
    appTitle: "To-Do Timer",
    appTag: "Manage tasks and timers together",
    setupTitle: "Add Tasks",
    taskLabel: "Task",
    taskPlaceholder: "e.g. Inbox cleanup",
    hourLabel: "Hr",
    minLabel: "Min",
    secLabel: "Sec",
    addBtn: "Add",
    listTitle: "Task List",
    clearBtn: "Reset",
    startBtn: "Start",
    aboutTitle: "About",
    aboutText: "Add tasks and run timers in order to stay focused.",
    termsLink: "Terms",
    contactLink: "Contact",
    privacyTitle: "Privacy Policy",
    privacyText:
      "This app stores tasks only in your browser and does not send data externally. Provide a custom policy for production use.",
    versionLabel: "Version",
    runTitle: "In Progress",
    backBtn: "Back to List",
    currentTask: "Current Task",
    stopBtn: "Finish Early",
    nextBtn: "Next",
    queueTitle: "Up Next",
    overallProgress: "Overall progress",
    toastClamped: "Time values were adjusted to the maximum.",
    toastEmpty: "Please enter a task.",
    toastAdded: "Task added.",
    toastCleared: "List reset.",
    toastNoTasks: "Add at least one task first.",
    doneAll: "All tasks completed!",
  },
};

function setLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (i18n[lang][key]) {
      el.setAttribute("placeholder", i18n[lang][key]);
    }
  });

  els.langKo.setAttribute("aria-pressed", lang === "ko");
  els.langEn.setAttribute("aria-pressed", lang === "en");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(els.toast._timer);
  els.toast._timer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}

function clampTimeInput() {
  let h = Number(els.hourInput.value || 0);
  let m = Number(els.minInput.value || 0);
  let s = Number(els.secInput.value || 0);
  let clamped = false;

  if (h > 23) {
    h = 23;
    clamped = true;
  }
  if (m > 59) {
    m = 59;
    clamped = true;
  }
  if (s > 59) {
    s = 59;
    clamped = true;
  }
  if (h < 0) h = 0;
  if (m < 0) m = 0;
  if (s < 0) s = 0;

  els.hourInput.value = h;
  els.minInput.value = m;
  els.secInput.value = s;

  if (clamped) {
    showToast(i18n[state.lang].toastClamped);
  }

  return { h, m, s };
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function renderTaskList() {
  els.taskList.innerHTML = "";
  state.tasks.forEach((task, idx) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
      <div>
        <h4>${task.title}</h4>
        <p>${formatTime(task.totalSeconds)}</p>
      </div>
      <div>#${idx + 1}</div>
    `;
    els.taskList.appendChild(li);
  });
}

function renderQueue() {
  els.queueList.innerHTML = "";
  state.tasks.slice(state.currentIndex + 1).forEach((task) => {
    const li = document.createElement("li");
    li.textContent = `${task.title} · ${formatTime(task.totalSeconds)}`;
    els.queueList.appendChild(li);
  });
}

function updateOverallProgress() {
  const total = state.tasks.length;
  if (!total) {
    els.progressBar.style.width = "0%";
    return;
  }

  let fraction = 0;
  if (state.currentIndex >= total) {
    fraction = 1;
  } else if (state.currentTotal > 0) {
    const elapsed = state.currentTotal - Math.max(0, state.remaining);
    fraction = Math.min(1, Math.max(0, elapsed / state.currentTotal));
  }

  const pct = ((state.currentIndex + fraction) / total) * 100;
  els.progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

function addTask() {
  const title = els.taskInput.value.trim();
  if (!title) {
    showToast(i18n[state.lang].toastEmpty);
    return;
  }

  const { h, m, s } = clampTimeInput();
  const totalSeconds = h * 3600 + m * 60 + s;
  if (totalSeconds === 0) {
    showToast(i18n[state.lang].toastEmpty);
    return;
  }

  state.tasks.push({ title, totalSeconds });
  els.taskInput.value = "";
  renderTaskList();
  updateOverallProgress();
  showToast(i18n[state.lang].toastAdded);
}

function clearList() {
  state.tasks = [];
  renderTaskList();
  updateOverallProgress();
  showToast(i18n[state.lang].toastCleared);
}

function startRun() {
  if (state.tasks.length === 0) {
    showToast(i18n[state.lang].toastNoTasks);
    return;
  }
  state.currentIndex = 0;
  switchToRunView();
  beginTask();
}

function switchToRunView() {
  els.setupView.classList.add("hidden");
  els.runView.classList.remove("hidden");
}

function switchToSetupView() {
  stopTimer();
  els.runView.classList.add("hidden");
  els.setupView.classList.remove("hidden");
}

function beginTask() {
  const task = state.tasks[state.currentIndex];
  if (!task) {
    els.currentTaskTitle.textContent = i18n[state.lang].doneAll;
    els.timeDisplay.textContent = "00:00:00";
    els.currentIndex.textContent = "0 / 0";
    els.nextBtn.disabled = true;
    state.currentTotal = 0;
    state.remaining = 0;
    updateOverallProgress();
    renderQueue();
    return;
  }

  state.remaining = task.totalSeconds;
  state.currentTotal = task.totalSeconds;
  els.currentTaskTitle.textContent = task.title;
  els.currentIndex.textContent = `${state.currentIndex + 1} / ${state.tasks.length}`;
  els.nextBtn.disabled = true;
  renderQueue();
  updateTimerDisplay();
  updateOverallProgress();
  stopTimer();

  state.timerId = setInterval(() => {
    state.remaining -= 1;
    updateTimerDisplay();
    updateOverallProgress();
    if (state.remaining <= 0) {
      finishTimer();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const safe = Math.max(0, state.remaining);
  els.timeDisplay.textContent = formatTime(safe);
}

function finishTimer() {
  stopTimer();
  state.remaining = 0;
  updateOverallProgress();
  playBeep();
  els.nextBtn.disabled = false;
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function nextTask() {
  state.currentIndex += 1;
  beginTask();
}

function earlyFinish() {
  stopTimer();
  state.remaining = 0;
  updateTimerDisplay();
  updateOverallProgress();
  els.nextBtn.disabled = false;
  playBeep();
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 500);
  } catch (err) {
    // Audio might be blocked; ignore.
  }
}

els.addTaskBtn.addEventListener("click", addTask);
els.clearListBtn.addEventListener("click", clearList);
els.startBtn.addEventListener("click", startRun);
els.backBtn.addEventListener("click", switchToSetupView);
els.nextBtn.addEventListener("click", nextTask);
els.stopBtn.addEventListener("click", earlyFinish);

[els.hourInput, els.minInput, els.secInput].forEach((el) => {
  el.addEventListener("change", clampTimeInput);
  el.addEventListener("blur", clampTimeInput);
});

els.langKo.addEventListener("click", () => setLanguage("ko"));
els.langEn.addEventListener("click", () => setLanguage("en"));

setLanguage("ko");
renderTaskList();
updateOverallProgress();
