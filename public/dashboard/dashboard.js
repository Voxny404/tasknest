const userName = AuthHelper.getUserName()
document.getElementById('username').textContent = userName;
let  userRoles = []

async function getUser() {
    const user = await AuthHelper.fetchUser(userName);
    let roles = user.roles;

    // Parse if roles is a string
    if (typeof roles === "string") {
        try {
            roles = JSON.parse(roles);
        } catch (e) {
            console.error("Failed to parse roles:", roles);
            roles = [];
        }
    }

    userRoles = roles
    updateDropdownVisibility();
}
getUser();

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




function updateDropdownVisibility() {
    const roles = userRoles
    const menuItems = {
        "mayDeleteUsers": document.getElementById("delete-user-button"),
        "mayCreateUsers": document.getElementById("create-user-button"),
        "mayCreateTasks": document.getElementById("create-task-button"),
        "mayEditUserRole": document.getElementById("edit-user-role-button"),
        "admin": document.querySelectorAll(".admin-only")
    };

    // Hide fixed items
    for (let key in menuItems) {
        const item = menuItems[key];
        if (item) {
            if (item instanceof NodeList) {
                item.forEach(el => el.style.display = "none");
            } else {
                item.style.display = "none";
            }
        }
    }

    // Hide dynamic buttons
    document.querySelectorAll(".edit, .delete").forEach(el => el.style.display = "none");

    // Show based on roles
    if (roles.includes("admin")) {
        for (let key in menuItems) {
            const item = menuItems[key];
            if (item instanceof NodeList) {
                item.forEach(el => el.style.display = "block");
            } else if (item) {
                item.style.display = "block";
            }
        }
        document.querySelectorAll(".edit, .delete").forEach(el => el.style.display = "block");
    } else {
        roles.forEach(role => {
            if (menuItems[role]) {
                const item = menuItems[role];
                if (item instanceof NodeList) {
                    item.forEach(el => el.style.display = "block");
                } else {
                    item.style.display = "block";
                }
            }
            // Handle dynamic roles separately
            if (role === "mayEditTasks") {
                document.querySelectorAll(".edit").forEach(el => el.style.display = "block");
            }
            if (role === "mayDeleteTasks") {
                document.querySelectorAll(".delete").forEach(el => el.style.display = "block");
            }
        });
    }
}

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
