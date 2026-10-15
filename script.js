const STORAGE_KEY = "orbit-tasks-v1";
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const filterButtons = document.querySelectorAll(".filter-button");
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const pendingCount = document.querySelector("#pending-count");
const visibleCount = document.querySelector("#visible-count");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedTasks)) return [];

    return savedTasks.filter((task) => (
      task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean"
    ));
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The list remains usable for this session if storage is unavailable.
  }
}

function makeIcon(path) {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");

  const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shape.setAttribute("d", path);
  icon.append(shape);
  return icon;
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((task) => !task.completed);
  if (currentFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;

  const toggleButton = document.createElement("button");
  toggleButton.className = "task-toggle";
  toggleButton.type = "button";
  toggleButton.setAttribute("aria-label", task.completed ? `Mark ${task.text} as active` : `Mark ${task.text} as completed`);
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  if (task.completed) toggleButton.append(makeIcon("M5 12l4 4L19 6"));
  toggleButton.addEventListener("click", () => {
    task.completed = !task.completed;
    saveTasks();
    render();
  });

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
  deleteButton.title = "Delete task";
  deleteButton.append(makeIcon("M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 11v5m4-5v5"));
  deleteButton.addEventListener("click", () => {
    tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
    saveTasks();
    render();
  });

  item.append(toggleButton, text, deleteButton);
  return item;
}

function renderEmptyState() {
  const empty = document.createElement("li");
  empty.className = "empty-state";
  const symbol = document.createElement("span");
  symbol.className = "empty-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = "✦";
  const title = document.createElement("p");
  const detail = document.createElement("span");

  if (tasks.length === 0) {
    title.textContent = "A clear sky. A fresh start.";
    detail.textContent = "Add a task above to set your first intention.";
  } else if (currentFilter === "active") {
    title.textContent = "Nothing left in flight.";
    detail.textContent = "You’ve completed every task. Nicely done.";
  } else {
    title.textContent = "No completed tasks just yet.";
    detail.textContent = "Your finished missions will show up here.";
  }

  empty.append(symbol, title, detail);
  taskList.append(empty);
}

function render() {
  const completed = tasks.filter((task) => task.completed).length;
  const visibleTasks = getVisibleTasks();

  totalCount.textContent = String(tasks.length);
  completedCount.textContent = String(completed);
  pendingCount.textContent = String(tasks.length - completed);
  visibleCount.textContent = String(visibleTasks.length);
  taskList.replaceChildren();

  if (visibleTasks.length === 0) {
    renderEmptyState();
  } else {
    visibleTasks.forEach((task) => taskList.append(createTaskElement(task)));
  }
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  taskInput.value = "";
  currentFilter = "all";
  filterButtons.forEach((button) => {
    const isSelected = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  render();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    render();
  });
});

render();