document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = localStorage.getItem('token'); // get token if logged in

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Make sure the username and password are not empty
    if (!username || !password) {
        alert('Please fill in both fields.');
        return;
    }

    if (!token) {
        alert("You are not allowed to do this!");
        return;
    }

    try {
        // Send registration request to the server
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // this is required!
            },
            body: JSON.stringify({ name: username, password: password })
        });
console.log(response)
        const result = await response.json();

        if (response.ok) {
            // If registration is successful, show success message or redirect
            alert('Registration successful!');
            window.location.href = '/auth/login';  // Redirect to the login page
        } else {
            // If registration fails, display an error message
            document.getElementById('error-message').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});

