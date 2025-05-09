document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page

    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    const errorMessage = document.getElementById('error-message');

    // Validate input fields
    if (!name || !password) {
        errorMessage.textContent = 'Please enter both username and password';
        return;
    }

    // Send the login request to the backend API
    try {
        const response = await fetch('/auth/login', {  // Note the prefix '/api'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, password }),
        });
        console.log(response)
        const data = await response.json();

        if (response.status === 200 && data.success) {
            // If login is successful, store the token and redirect to another page
            localStorage.setItem('token', data.token); // Store JWT token in localStorage
            window.location.href = '/dashboard'; // Redirect to a protected page (dashboard)
        } else {
            // If login fails, show an error message
            errorMessage.textContent = data.message || 'An error occurred, please try again later.';
        }
    } catch (error) {
        console.error('Login failed:', error);
        errorMessage.textContent = 'An error occurred, please try again later.';
    }
});

