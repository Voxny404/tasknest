const taskCreator = new TaskCreator();

//document.getElementById('createTaskForm').addEventListener('submit', handleFormSubmit);

// Function to get form data
function getFormData() {
    return {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        state: document.getElementById('state').value,
        priority: document.getElementById('priority').value,
        type: document.getElementById('type').value,
        topic: document.getElementById('topic').value,
        report: document.getElementById('report').value
    };
}

// Function to display success or error messages
function displayMessage(message, isSuccess) {
    const messageElement = document.getElementById('message');
    messageElement.innerHTML = `
        <p style="color: ${isSuccess ? 'green' : 'red'};">${message}</p>
    `;
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();  // Prevent the form from submitting the traditional way
    const taskData = getFormData();  // Get the form data
    
    // Show fullscreen loading and disable form to prevent resubmission
    showFullscreenLoader("create-fullscreen-loading");
    disableForm(true);  // Disable form fields to prevent multiple submissions

    try {
        // Attempt to create the task
        const result = await taskCreator.createTask(taskData);
        
        // Show success message and reset form
        displayMessage(`Task created successfully! Task ID: ${result.id}`, true);
        alert("Task created successfully!") 
        // Optionally, reset the form after successful creation
        document.getElementById('createTaskForm').reset();
        
    } catch (error) {
        // Display error message if task creation fails
        alert(error.message || "An unexpected error occurred.");
    } finally {
        // Always hide fullscreen loader and re-enable the form
        hideFullscreenLoader("create-fullscreen-loading");
        disableForm(false);  // Re-enable form after submission is complete
    }
}

/**
 * Disable or enable the form fields
 * @param {boolean} disable - Whether to disable the form or not
 */
function disableForm(disable) {
    const formElements = document.querySelectorAll('#createTaskForm input, #createTaskForm select, #createTaskForm button');
    formElements.forEach((element) => {
        element.disabled = disable;
    });
}

function loadOptionsForCreateTasks() {
    taskCreator.populateSelectFromApi('category', 'categories');
    taskCreator.populateSelectFromApi('state', 'state');
    taskCreator.populateSelectFromApi('priority', 'priority');
    taskCreator.populateSelectFromApi('type', 'types');
}
