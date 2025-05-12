class AuthHelper {
    // Helper function to decode the token safely
    static decodeToken(token) {
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Helper function to handle token validation and redirection
    static validateToken() {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("You need to be logged in to view tasks.");
            window.location.href = '/auth/login'; // Redirect if no token is found
            return null; // Return null to signify failed validation
        }

        const decoded = this.decodeToken(token);
        if (!decoded) {
            alert("Invalid token. Please log in again.");
            window.location.href = '/auth/login'; // Redirect if the token is invalid
            return null;
        }

        return { token, decoded }; // Return token and decoded info if valid
    }

    // Function to get the username from the decoded token
    static getUserName() {
        const { decoded } = this.validateToken();
        return decoded ? decoded.user : null;
    }
    
    static async fetchAllUsers() {
        const { token } = this.validateToken();
        const response = await fetch('/auth/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return await response.json();
    }

    static async fetchUser(user) {
        const { token } = this.validateToken();
        try {
            
            const response = await fetch(`/auth/user?userName=${encodeURIComponent(user)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user roles');
            }

            return await response.json();
        } catch (error) {
            alert("Booting out")
            localStorage.removeItem('token')
            window.location.href='/auth/login'
            return;
        }
    }



}

