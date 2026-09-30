document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const currentDateElem = document.getElementById('current-date');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Display current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElem.textContent = new Date().toLocaleDateString('en-US', options);

    // Save and load from localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Render tasks based on filter
    function renderTasks() {
        taskList.innerHTML = '';

        let filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<li class="list-group-item text-center text-muted py-3">No tasks found.</li>`;
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `list-group-item d-flex justify-content-between align-items-center py-3`;
            
            li.innerHTML = `
                <div class="d-flex align-items-center flex-grow-1 me-3">
                    <input type="checkbox" class="form-check-input me-3 toggle-task" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                    <span class="task-title ${task.completed ? 'completed-task' : ''}" data-id="${task.id}">${escapeHtml(task.title)}</span>
                </div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary edit-btn" data-id="${task.id}">Edit</button>
                    <button class="btn btn-outline-danger delete-btn" data-id="${task.id}">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // Add task function
    function addTask() {
        const title = taskInput.value.trim();
        if (title === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(),
            title: title,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
    }

    // Event listeners for Add
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Handle task actions (Toggle, Delete, Edit)
    taskList.addEventListener('click', (e) => {
        const id = Number(e.target.dataset.id);

        // Toggle Complete
        if (e.target.classList.contains('toggle-task')) {
            tasks = tasks.map(task => task.id === id ? { ...task, completed: e.target.checked } : task);
            saveTasks();
            renderTasks();
        }

        // Delete Task
        if (e.target.classList.contains('delete-btn')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }

        // Edit Task Inline
        if (e.target.classList.contains('edit-btn')) {
            const taskSpan = document.querySelector(`.task-title[data-id="${id}"]`);
            const currentTitle = tasks.find(task => task.id === id).title;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control form-control-sm me-2';
            input.value = currentTitle;

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn btn-success btn-sm me-1';
            saveBtn.textContent = 'Save';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary btn-sm';
            cancelBtn.textContent = 'Cancel';

            const parentDiv = taskSpan.parentElement;
            parentDiv.innerHTML = '';
            parentDiv.appendChild(input);
            parentDiv.appendChild(saveBtn);
            parentDiv.appendChild(cancelBtn);

            saveBtn.addEventListener('click', () => {
                const updatedTitle = input.value.trim();
                if (updatedTitle !== '') {
                    tasks = tasks.map(task => task.id === id ? { ...task, title: updatedTitle } : task);
                    saveTasks();
                }
                renderTasks();
            });

            cancelBtn.addEventListener('click', () => {
                renderTasks();
            });
        }
    });

    // Filter buttons click handler
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    // Helper to prevent XSS
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Initial render
    renderTasks();
});