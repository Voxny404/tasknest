class TaskCreator {
    // Function to create a task
    async createTask(taskData) {
        const { token, decoded } = AuthHelper.validateToken();  // Use the AuthHelper class for token validation
        if (!token) return; // Return early if token is invalid or missing
        if (!taskData) return console.warn("Cannot create task from nothing!");
        try {
            const response = await fetch('/api/tasks/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskData)
            });

            const result = await response.json();
            if (response.ok) {
                return result; // Return the result if task creation is successful
            } else {
                throw new Error(result.error || 'An error occurred while creating the task.');
            }
        } catch (error) {
            console.error('Error:', error);
            throw new Error('An error occurred while creating the task. Please try again.');
        }
    }

    async updateTask({ taskId, updates }) {

        // updateTask({
        //     taskId: '12345',
        //     updates: {
        //         userName: 'john_doe',
        //         state: 'in-progress',
        //         report: 'Work started',
        //         priority: 'high',
        //         type: 'bug',
        //         topic: 'login',
        //         title: 'Fix login redirect'
        //     }
        // });

        const { token } = AuthHelper.validateToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/tasks/update?id=${encodeURIComponent(taskId)}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Task updated successfully!');
                return true; // Optionally refresh the task list
            } else {
                alert(`Error updating task: ${data.error}`);
                return false;
            }
        } catch (error) {
            console.error('Error updating task:', error);
            alert('An error occurred while updating the task.');
            return false;
        }
    }

    async deleteTask(taskId) {
        const { token } = AuthHelper.validateToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/tasks/delete?id=${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Task deleted successfully!');
                const taskCard = document.getElementById(`task-${taskId}`);
                if (taskCard) {
                    taskCard.remove();
                }
                return true;
            } else {
                const errorData = await response.json();
                alert(`Error deleting task: ${errorData.error}`);
                return false
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('An error occurred while deleting the task.');
            return false;
        }
    }

    async fetchAllTasks() {
        const { token } = AuthHelper.validateToken();
        if (!token) return;

        try {
            
            const response = await fetch('/api/tasks/getAll', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                alert('Failed to fetch tasks');
                return false;
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting tasks:', error);
            alert('An error occurred while getting all tasks.');
            return false;
        }
    }
    async fetchTaskData(taskId) {
        const { token } = AuthHelper.validateToken();
        if (!token) return;

        try {
            
            const response = await fetch(`/api/tasks/get?id=${taskId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (!response.ok) {
              throw new Error('Task not found');
            }
            const task = await response.json();
            return task;
        } catch (error) {
            console.error('Failed to fetch task:', error);
            throw error;
        }
    }
}
