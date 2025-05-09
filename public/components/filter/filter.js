

// ✅ Initialize necessary variables
const filterTask = new FilterTask();

let userTasksPaginationState = {
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    filters: {}
};

let searchTasksPaginationState = {
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    filters: {}
};

async function getFilteredTasks(filters, page, loadingDisplayId) {
    showLoading(loadingDisplayId);
    try {
        return await filterTask.getTask(filters, page);
    } finally {
        hideLoading(loadingDisplayId);
    }
}

// ✅ Display tasks
function displayFilteredTasks(tasks, clean = false, containerId = 'task-list') {
    if (!Array.isArray(tasks)) return alert("No tasks found");

    const taskListElement = DOM[containerId];
    if (!taskListElement) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    if (clean) taskListElement.innerHTML = '';
    if (tasks.length === 0) {
        taskListElement.innerHTML = '<p>No tasks found.</p>';
        return;
    }

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.setAttribute('data-task-id', task.id);
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p><strong>Description:</strong> ${task.description}</p>
            <div class="topic"><strong>Topic:</strong> ${task.topic}</div>
            <div class="${getStatusClass(task.state)}">Status: ${task.state}</div>
            <div class="hashtag-group">
                <div class="category"><span class="hashtag ${getCategoryClass(task.category)}">#${task.category}</span></div>
                <div class="priority"><span class="hashtag ${getPriorityClass(task.priority)}">#${task.priority}</span></div>
                <div class="type"><span class="hashtag ${getTypeClass(task.type)}">#${task.type}</span></div>
            </div>
            ${task.userName ? `<div class="user-name">Assigned User: ${task.userName}</div>` : ""}            
            <button class="delete">X</button>
            <button class="edit">Edit</button>
            <button class="view">View</button>
            <div class="card-timestamp">${getReadableTimeFromId(task.id)}</div>
        `;

        // Delete
        taskCard.querySelector('.delete').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete ${task.title}?`)) {
                taskCreator.deleteTask(task.id);
                taskCard.remove();
            }
        });

        // Edit
        taskCard.querySelector('.edit').addEventListener('click', () => {
            // Dynamically fetch current data from the DOM instead of using the stale `task` object
            const updatedTask = {
                id: task.id,
                title: taskCard.querySelector('h3').textContent,
                description: taskCard.querySelector('p').textContent,
                report: task.report, // If not shown in DOM, fallback to original
                category: taskCard.querySelector('.category').textContent,
                state: taskCard.querySelector('.status').textContent,
                priority: taskCard.querySelector('.priority').textContent,
                type: taskCard.querySelector('.type').textContent,     // If not shown, fallback to original
                topic: taskCard.querySelector('.topic').textContent,   // Same here
                userName: taskCard.querySelector('.user-name')?.textContent || '',
            };

            const taskData = encodeURIComponent(JSON.stringify(updatedTask));
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                window.location.href = `/dashboard/tasks/edit?task=${taskData}`;
            } else {
                const editWindow = window.open(`/dashboard/tasks/edit?task=${taskData}`, '_blank', 'width=800,height=600');

                if (editWindow) {
                    const intervalId = setInterval(() => {
                        if (editWindow.closed) {
                            clearInterval(intervalId);
                            // Optionally update or reload here
                        }
                    }, 1000);
                }
            }
        });
        // View
        taskCard.querySelector('.view').addEventListener('click', () => {
            const taskData = encodeURIComponent(JSON.stringify(task));
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) window.location.href = `/dashboard/tasks/view?task=${taskData}`;
            else window.open(`/dashboard/tasks/view?task=${taskData}`, '_blank', 'width=800,height=600');
        });

        taskListElement.appendChild(taskCard);
    });
}


function getReadableTimeFromId(taskId) {
      const timestampPart = taskId.split('-')[0];
      const year = timestampPart.slice(0, 4);
      const month = timestampPart.slice(4, 6);
      const day = timestampPart.slice(6, 8);
      const hour = timestampPart.slice(8, 10);
      const minute = timestampPart.slice(10, 12);
      const second = timestampPart.slice(12, 14);
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      return date.toLocaleString(); // Format as a readable string
}

function updateTaskCard(task) {
    const taskCard = document.querySelector(`.task-card[data-task-id='${task.id}']`);
    if (!taskCard) return console.warn("updateTaskCard: cannot find task card with id", task.id);

    taskCard.querySelector('h3').textContent = task.title;
    taskCard.querySelector('p').textContent = task.description;
    taskCard.querySelector('.status').textContent = task.state;
    taskCard.querySelector('.category').textContent = task.category;
    taskCard.querySelector('.priority').textContent = task.priority;

    let userEl = taskCard.querySelector('.user-name');
    if (!userEl) {
        userEl = document.createElement('div');
        userEl.classList.add('user-name');
        taskCard.appendChild(userEl);
    }
    userEl.textContent = task.userName || '';
}

// ✅ Debounce helper
function debounce(func, delay = 200) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// ✅ Filter form handler
function applyFilterListener(containerId, paginationState, taskListContainerId, loadingDisplayId = 'task-loading') {
    const form = DOM.taskFilterForm;
    const taskListElement = DOM[taskListContainerId || 'task-list'];

    if (!form || !taskListElement) {
        console.error('Form or task list element not found!');
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const filters = {
            name: DOM.taskName?.value,
            state: DOM.taskState?.value,
            category: DOM.taskCategory?.value,
            priority: DOM.taskPriority?.value,
            type: DOM.taskType?.value,
            topic: DOM.taskTopic?.value,
            userName: DOM.taskUserName?.value
        };

        paginationState.currentPage = 1;
        paginationState.hasMore = true;
        paginationState.isLoading = true;
        paginationState.filters = filters;

        taskListElement.innerHTML = '';
        
        showLoading(loadingDisplayId);
        try {
            const tasks = await filterTask.getTask(paginationState.filters, paginationState.currentPage);
            displayFilteredTasks(tasks, true, taskListContainerId);

            if (tasks.length < 5) {
                paginationState.hasMore = false;
            } else {
                paginationState.currentPage++;
            }
        } catch (err) {
            console.error('Error fetching filtered tasks:', err);
            taskListElement.innerHTML = `<p class="error">Failed to load tasks. Please try again later.</p>`;
        } finally {
            paginationState.isLoading = false;
            hideLoading(loadingDisplayId);
        }
    });
}

// ✅ Pagination on scroll
function applyPagination(containerId, paginationState, taskListContainerId = 'task-list', loadingDisplayId = 'task-loading') {
    const container = DOM[containerId];
    if (!container) {
        console.error('Container not found!');
        return;
    }

    const handleScroll = async () => {
        const nearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

        if (nearBottom && !paginationState.isLoading && paginationState.hasMore) {
            paginationState.isLoading = true;
            
            showLoading(loadingDisplayId);
            
            try {
                const tasks = await getFilteredTasks(paginationState.filters, paginationState.currentPage);
                if (tasks && tasks.length > 0) {
                    displayFilteredTasks(tasks, false, taskListContainerId);
                    paginationState.currentPage++;
                    if (tasks.length < 5) paginationState.hasMore = false;
                } else {
                    paginationState.hasMore = false;
                }
            } catch (err) {
                console.error('Pagination fetch error:', err);
            } finally {
                paginationState.isLoading = false;

                hideLoading(loadingDisplayId);
            }
        }
    };

    container.removeEventListener('scroll', handleScroll);
    container.addEventListener('scroll', debounce(handleScroll, 150));
}

// ✅ Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadTasksByUser();
});

// ✅ Load tasks by user
async function loadTasksByUser() {
    showLoading();
    try {
        const tasks = await filterTask.getTask({ userName: AuthHelper.getUserName() }, 1);
        displayFilteredTasks(tasks, true);
    } catch (err) {
        console.error("Failed to load tasks for user:", err);
    } finally {
        hideLoading();
    }
}
