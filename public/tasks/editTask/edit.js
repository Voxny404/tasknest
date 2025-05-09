
const taskCreator = new TaskCreator();

async function populateFormWithTaskData(taskData) {
    for (const key in taskData) {
        const element = document.getElementById(key);
        if (element) {
            element.value = taskData[key];
        }
    }

    const users = await AuthHelper.fetchAllUsers();
    const userSelect = document.getElementById('userName');

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a user';
    defaultOption.disabled = true;
    defaultOption.selected = !taskData.userName; // selected if userName is null or empty
    userSelect.appendChild(defaultOption);

    // Populate user options
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.name;
        option.textContent = user.name;

        if (user.name === taskData.userName) {
            option.selected = true;
        }

        userSelect.appendChild(option);
    });
}

function disableForm(disable) {
    const formElements = document.querySelectorAll('#editTaskForm input, #editTaskForm select, #editTaskForm button');
    formElements.forEach((element) => {
        element.disabled = disable;
    });
}

async function handleFormSubmit(event, taskData) {
    event.preventDefault();
    const updatedTask = {
        userName: document.getElementById("userName").value, 
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
    disableForm(true);  // Disable the form while the task is being updated

    try {
        await taskCreator.updateTask({
            taskId: taskData.id,
            updates: updatedTask
        });

        if (window.opener) {
            window.opener.postMessage({ type: 'TASK_UPDATED', payload: { ...updatedTask, id: taskData.id } }, '*');
            // ✅ Close the popup
            window.close();
        } else console.log("skipping task saver")

    } catch (error) {
        console.error('Error updating task:', error);
        alert(error.message || 'An unexpected error occurred.', false); // Show error message
    } finally {
        hideFullscreenLoader("edit-fullscreen-loading");
        disableForm(false); // Re-enable the form
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

