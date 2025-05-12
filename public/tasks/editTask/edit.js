
const taskCreator = new TaskCreator();

async function populateFormWithTaskData(taskData) {
    // Populate input and textarea fields (skip <select>)
    for (const key in taskData) {
        const element = document.getElementById(key);
        if (element && element.tagName !== 'SELECT') {
            element.value = taskData[key] || '';
        }
    }

    const userSelect = document.getElementById('userName');
    userSelect.innerHTML = ''; // Clear existing options

    const users = await AuthHelper.fetchAllUsers();

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a user';
    defaultOption.disabled = true;
    defaultOption.selected = !taskData.userName;
    userSelect.appendChild(defaultOption);

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.name;
        option.textContent = user.name;
        if (user.name === taskData.userName) {
            option.selected = true;
        }
        userSelect.appendChild(option);
    });

    // Set <select> values for state, priority, type if applicable
    ['state', 'priority', 'type'].forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select && taskData[selectId]) {
            select.value = taskData[selectId];
        }
    });
}

function disableForm(disable) {
    const formElements = document.querySelectorAll('#editTaskForm input, #editTaskForm select, #editTaskForm button, #editTaskForm textarea');
    formElements.forEach((element) => {
        element.disabled = disable;
    });
}

async function handleFormSubmit(event, taskData) {
    event.preventDefault();

    const updatedTask = {
        userName: document.getElementById('userName').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        report: document.getElementById('report').value,
        category: document.getElementById('category').value,
        state: document.getElementById('state').value,
        priority: document.getElementById('priority').value,
        type: document.getElementById('type').value,
        topic: document.getElementById('topic').value,
    };

    console.log("Updated Task:", updatedTask);

    showFullscreenLoader("edit-fullscreen-loading");
    disableForm(true);

    try {
        await taskCreator.updateTask({
            taskId: taskData.id,
            updates: updatedTask
        });

        if (window.opener) {
            window.opener.postMessage({ type: 'TASK_UPDATED', payload: { ...updatedTask, id: taskData.id } }, '*');
            window.close();
        } else {
            console.log("skipping task saver");
        }

    } catch (error) {
        console.error('Error updating task:', error);
        alert(error.message || 'An unexpected error occurred.');
    } finally {
        hideFullscreenLoader("edit-fullscreen-loading");
        disableForm(false);
    }
}

async function applyEditEventListener(taskData) {
    await populateFormWithTaskData(taskData);

    document.getElementById('editTaskForm').addEventListener('submit', (event) => {
        handleFormSubmit(event, taskData);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const taskParam = params.get('task');

    if (!taskParam) {
        alert('No task data provided');
        return;
    }

    try {
        const task = JSON.parse(decodeURIComponent(taskParam));
        console.log('Loaded task:', task);
        applyEditEventListener(task);
    } catch (err) {
        console.error('Error decoding task data:', err);
    }
});

