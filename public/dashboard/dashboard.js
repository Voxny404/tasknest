const userName = AuthHelper.getUserName()
document.getElementById('username').textContent = userName;

(async function loadTasksByUser() {
    // Reset pagination state
    userTasksPaginationState = {
        currentPage: 1,
        isLoading: false,
        hasMore: true,
        filters: { userName }
    };

    document.getElementById('task-list').innerHTML = '';

    try {
        const tasks = await getFilteredTasks(userTasksPaginationState.filters, userTasksPaginationState.currentPage);
        displayFilteredTasks(tasks, true);
        if (tasks.length < 5) {
            userTasksPaginationState.hasMore = false;
        } else {
            userTasksPaginationState.currentPage++;
        }

        applyPagination('dashboard-wrapper', userTasksPaginationState);
    } catch (err) {
        console.error('Failed to load tasks for user:', err);
    }
})();

const createTaskButton = document.getElementById("create-task-button");
createTaskButton.onclick = () => {
  loadCreateTaskForm() 
}

async function loadCreateTaskForm() {
    showFullscreenLoader()
    
    const response = await fetch('/components/createTask/createTask.html');
    const html = await response.text();
    
    hideFullscreenLoader()
    showOverlay(html);  // Reuse your modal logic from earlier
    document.getElementById('createTaskForm').addEventListener('submit', handleFormSubmit);
}


const searchTaskButton = document.getElementById("search-task-button");
searchTaskButton.onclick = () => {
  loadSearchTaskForm() 
}

async function loadSearchTaskForm() {
    showFullscreenLoader()
    const response = await fetch('/components/searchTasks/search.html');
    const html = await response.text();
    hideFullscreenLoader()
    showOverlay(html);

    setTimeout(() => {
        // Reset state
                // Re-trigger lookup for lazy DOM elements added via innerHTML
        DOM['search-task-loading'];
        DOM['search-task-list'];
        searchTasksPaginationState = {
            currentPage: 1,
            isLoading: false,
            hasMore: true,
            filters: {}
        };

        getFilteredTasks(searchTasksPaginationState.filters, searchTasksPaginationState.currentPage, "search-task-loading").then(tasks => {
            displayFilteredTasks(tasks, true, "search-task-list");
            if (tasks.length < 5) {
                searchTasksPaginationState.hasMore = false;
            } else {
                searchTasksPaginationState.currentPage++;
            }

            applyFilterListener("filter-wrapper", searchTasksPaginationState, 'search-task-list',"search-task-loading");
            applyPagination("filter-wrapper", searchTasksPaginationState, 'search-task-list', "search-task-loading");
        });
    }, 50);
}

window.addEventListener('message', (event) => {
    if (event.data?.type === 'TASK_UPDATED') {
        updateTaskCard(event.data.payload); // Re-use your existing updater
    }
});

const backToTopBtn = document.getElementById("backToTopBtn");
const dashboardWrapper = document.getElementById("dashboard-wrapper");

dashboardWrapper.addEventListener("scroll", () => {
  if (dashboardWrapper.scrollTop > 30) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  dashboardWrapper.scrollTo({ top: 0, behavior: "smooth" });
});
