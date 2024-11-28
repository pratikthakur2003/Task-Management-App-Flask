const API_URL = "/api/tasks";
let allTasks = []; // to store all tasks

document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("dueDate").value;

  // Validation: Check if title is empty
  if (!title) {
    alert("Title cannot be empty!");
    return;
  }

  // Validation: Check if dueDate is a valid date
  if (dueDate && isNaN(new Date(dueDate).getTime())) {
    alert("Please enter a valid due date!");
    return;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, due_date: dueDate }),
  });
  if (response.ok) {
    fetchTasks();
    e.target.reset();
  } else {
    alert("Failed to add task");
  }
});

let currentEditTask = null; // To store the task being edited

// MODAL

function openModal(task) {
  try {
    const modal = document.getElementById("editModal");
    document.getElementById("editTitle").value = task.title;
    document.getElementById("editDescription").value = task.description || "";
    document.getElementById("editDueDate").value = task.due_date;
    document.getElementById("editTaskId").value = task.id;
    currentEditTask = task; 
    modal.style.display = "flex";
  } catch {
    console.error();
  }
}

function closeModal() {
  const modal = document.getElementById("editModal");
  modal.style.display = "none";
  currentEditTask = null; 
}

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editTaskId").value;
  const updatedTask = {
    title: document.getElementById("editTitle").value,
    description: document.getElementById("editDescription").value,
    due_date: document.getElementById("editDueDate").value,
  };

  if (confirm("Are you sure you want to update this task?")) {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
    fetchTasks(); 
    closeModal(); 
  }
});

// TABLE / CARD

async function fetchTasks() {
  const response = await fetch(API_URL);
  allTasks = await response.json();
  renderTasks(allTasks);
}

function renderTasks(tasks) {
  const tasksDiv = document.getElementById("tasks");
  tasksDiv.innerHTML = "";

  if (tasks.length == 0) {
    const noTask = document.createElement("div");
    noTask.style.display = "flex";
    noTask.style.justifyContent = "center";
    noTask.style.alignItems = "center";
    noTask.textContent = "No Tasks to Display";
    tasksDiv.appendChild(noTask);
    return;
  }

  const table = document.createElement("table");
  table.classList.add("task-table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Sr. No</th>
        <th>Title</th>
        <th>Description</th>
        <th>Due Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement("tbody");
  let count = 1;

  tasks.forEach((task) => {
    const row = document.createElement("tr");
    row.style.backgroundColor =( task.status == "Pending" ? "lightcoral" : "lightgreen");
    row.innerHTML = `
      <td>${count++}</td>
      <td>${task.title}</td>
      <td>${task.description || "N/A"}</td>
      <td>${task.due_date || "No Due Date"}</td>
      <td>
        <button class="toggle-status">${task.status}</button>
      </td>
      <td>
        <button class="edit-task">Edit</button>
        <button class="delete-task">Delete</button>
      </td>
    `;

    row
      .querySelector(".toggle-status")
      .addEventListener("click", () => toggleStatus(task.id));
    row
      .querySelector(".edit-task")
      .addEventListener("click", () => openModal(task));
    row
      .querySelector(".delete-task")
      .addEventListener("click", () => deleteTask(task.id));
    tbody.appendChild(row);

    const card = document.createElement("div");
    card.style.backgroundColor =( task.status == "Pending" ? "lightcoral" : "lightgreen");
    card.classList.add("task-card");
    card.innerHTML = `
      <div><strong>Title:</strong> ${task.title}</div>
      <div><strong>Description:</strong> ${task.description || "N/A"}</div>
      <div><strong>Due Date:</strong> ${task.due_date || "No Due Date"}</div>
      <div><strong>Status:</strong> <button class="toggle-status">${task.status}</button></div>
      <div class="task-actions">
        <button class="edit-task">Edit</button>
        <button class="delete-task">Delete</button>
      </div>
    `;

    card
      .querySelector(".edit-task")
      .addEventListener("click", () => openModal(task));
    card
      .querySelector(".delete-task")
      .addEventListener("click", () => deleteTask(task.id));
    card
      .querySelector(".toggle-status")
      ?.addEventListener("click", () => toggleStatus(task.id));

    tasksDiv.appendChild(card);
  });

  table.appendChild(tbody);
  tasksDiv.appendChild(table);
}

// BUTTON FUNCTIONS

async function deleteTask(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchTasks();
  }
}

async function toggleStatus(id) {
  const response = await fetch(`${API_URL}/${id}`);
  const task = await response.json();
  const newStatus = task.status === "Pending" ? "Completed" : "Pending";
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  fetchTasks();
}

function filterTasks(status) {
  if (status === "All") {
    renderTasks(allTasks);
  } else {
    const filteredTasks = allTasks.filter((task) => task.status === status);
    renderTasks(filteredTasks);
  }
}

// Initial fetch of tasks
fetchTasks();
