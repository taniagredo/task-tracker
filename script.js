document.addEventListener("DOMContentLoaded", () => {
    const languageToggle = document.getElementById("language-toggle");
    const themeToggle = document.getElementById("theme-toggle");
    const title = document.getElementById("title");
    const addTaskBtn = document.getElementById("add-task");
    const newTaskInput = document.getElementById("new-task");
    const filters = document.querySelectorAll(".filter");
    const taskList = document.getElementById("task-list");
    const notification = document.getElementById("notification");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let language = "es";
    let theme = ["neon", "dark", "light"];
    let currentThemeIndex = 0;
    let currentFilter = "all";

    const translations = {
        en: { title: "Task Tracker", addTask: "Add", newTaskPlaceholder: "Add new task...", filters: { all: "All", pending: "Pending", completed: "Completed" } },
        es: { title: "Seguimiento de Tareas", addTask: "Agregar", newTaskPlaceholder: "Agregar nueva tarea...", filters: { all: "Todas", pending: "Pendientes", completed: "Completadas" } }
    };

    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = "block";
        setTimeout(() => { notification.style.display = "none"; }, 2000);
    }

    function updateLanguage() {
        const t = translations[language];
        title.textContent = t.title;
        addTaskBtn.textContent = t.addTask;
        newTaskInput.placeholder = t.newTaskPlaceholder;
        filters.forEach(filter => { filter.textContent = t.filters[filter.dataset.filter]; });
    }

    languageToggle.addEventListener("click", () => {
        language = language === "es" ? "en" : "es";
        updateLanguage();
    });

    themeToggle.addEventListener("click", () => {
        currentThemeIndex = (currentThemeIndex + 1) % theme.length;
        document.body.className = theme[currentThemeIndex];
        showNotification(`Tema cambiado a ${theme[currentThemeIndex]}`);
    });

    addTaskBtn.addEventListener("click", () => {
        const taskText = newTaskInput.value.trim();
        if (taskText === "") return;

        tasks.push({ text: taskText, completed: false });
        newTaskInput.value = "";
        saveTasks();
        renderTasks();
        showNotification(language === "es" ? "Tarea agregada" : "Task added");
    });

    function renderTasks() {
        taskList.innerHTML = "";
        tasks
            .filter(task => currentFilter === "all" || (currentFilter === "pending" && !task.completed) || (currentFilter === "completed" && task.completed))
            .forEach((task, index) => {
                const li = document.createElement("li");
                li.className = task.completed ? "completed" : "";
                li.setAttribute("draggable", true); // Hacer las tareas arrastrables
                li.dataset.index = index;

                li.innerHTML = `
                    <span>${task.text}</span>
                    <div>
                        <button class="edit-btn" onclick="editTask(${index})">✏️</button>
                        <button class="delete-btn" onclick="deleteTask(${index})">🗑️</button>
                    </div>
                `;

                li.addEventListener("click", () => toggleComplete(index));
                
                // Eventos Drag & Drop
                li.addEventListener("dragstart", handleDragStart);
                li.addEventListener("dragover", handleDragOver);
                li.addEventListener("drop", handleDrop);
                li.addEventListener("dragend", handleDragEnd);

                taskList.appendChild(li);
            });
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    window.editTask = (index) => {
        const newText = prompt(language === "es" ? "Editar tarea:" : "Edit task:", tasks[index].text);
        if (newText) {
            tasks[index].text = newText;
            saveTasks();
            renderTasks();
            showNotification(language === "es" ? "Tarea editada" : "Task edited");
        }
    };

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
        showNotification(language === "es" ? "Tarea eliminada" : "Task deleted");
    };

    filters.forEach(filter => {
        filter.addEventListener("click", () => {
            filters.forEach(btn => btn.classList.remove("active"));
            filter.classList.add("active");
            currentFilter = filter.dataset.filter;
            renderTasks();
        });
    });

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // 🎯 FUNCIONES DRAG & DROP  
    let draggedItem = null;

    function handleDragStart(event) {
        draggedItem = event.target;
        event.target.style.opacity = "0.5";
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        if (draggedItem !== event.target) {
            let fromIndex = draggedItem.dataset.index;
            let toIndex = event.target.dataset.index;

            // Intercambiar posiciones en el array de tareas
            let movedTask = tasks.splice(fromIndex, 1)[0];
            tasks.splice(toIndex, 0, movedTask);

            saveTasks();
            renderTasks();
        }
    }

    function handleDragEnd(event) {
        event.target.style.opacity = "1";
    }

    renderTasks();
    updateLanguage();
});