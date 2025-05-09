
// Initialize FilterTask class
// const filterTask = new FilterTask();
//
// // Example: Fetch tasks with filters and pagination (page 1)
// const filters = { status: 'open' };
// filterTask.getTask(filters, 1);

class FilterTask { 

    // Function to clean up empty filter fields
    cleanFilters(filters) {
        return Object.fromEntries(Object.entries(filters).filter(([key, value]) => value));
    }

    // Function to handle fetching tasks with filters and pagination
    async getTask(filters = {}, page = 1) {
        //console.log("applied filter : ", filters)
        const { token, decoded } = AuthHelper.validateToken();  // Use the AuthHelper class for token validation
        if (!token) return; // Return early if token is invalid or missing

        // Prepare the filters with pagination and user data
        const filtersWithPagination = this.prepareFilters(filters, page, decoded);
        const queryParams = new URLSearchParams(filtersWithPagination).toString();

        try {
            const response = await fetch(`/api/tasks/filter?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Include token in Authorization header
                }
            });

            if (response.ok) {
                const data = await response.json();
                //console.log(data)
                this.updatePagination(data.pagination.totalPages, page); // Update pagination controls
                return data.tasks;
            } else {
                throw new Error("Failed to load tasks.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching tasks. Please try again.');
        }
    }

    // Function to prepare the filter object with user data, pagination, and other filters
    prepareFilters(filters, page, decoded) {
        const limit = 5; // Number of tasks per page
        const offset = (page - 1) * limit; // Calculate the offset based on the current page

        const filtersWithPagination = {
            ...filters,
            limit, // Tasks per page
            offset, // Pagination offset
        };

        return this.cleanFilters(filtersWithPagination); // Clean the filters before returning
    }

    // Function to update pagination controls (like buttons)
    updatePagination(totalCount, currentPage) {
        const totalPages = Math.ceil(totalCount / 5); // Calculate the total number of pages
        // Add logic here to update pagination buttons (next/prev, page numbers, etc.)
        //console.log(`Total Pages: ${totalPages}, Current Page: ${currentPage}`);
        // For example, you could enable/disable next/previous buttons or show page numbers
    }
}

