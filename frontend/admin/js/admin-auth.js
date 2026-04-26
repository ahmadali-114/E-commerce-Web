const API_URL = '/api';

function checkExistingSession() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (token && user && user.isAdmin) {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error checking session:', error);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

checkExistingSession();

function validateForm(email, password) {
    const errors = [];
    
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    return errors;
}

function setLoading(isLoading) {
    const loginBtn = document.getElementById('loginBtn');
    
    if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>Logging in...</span> <i class="fas fa-spinner fa-spin"></i>';
    } else {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Access Admin Panel</span> <i class="fas fa-arrow-right"></i>';
    }
}

function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('loginMessage');
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';

    const escapedMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
    messageDiv.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${icon}"></i> 
            ${escapedMessage}
        </div>
    `;
}

// Handle login form submission
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('loginMessage');
    
    // Clear previous messages
    messageDiv.innerHTML = '';
    
    // Validate form
    const errors = validateForm(email, password);
    if (errors.length > 0) {
        showMessage(errors.join('<br>'), 'error');
        return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed. Please check your credentials.');
        }

        if (!data.user || !data.token) {
            throw new Error('Invalid response from server');
        }

        if (!data.user.isAdmin) {
            showMessage('Access denied. Admin privileges required.', 'error');
            setLoading(false);
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data.user.id,
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            email: data.user.email,
            isAdmin: data.user.isAdmin
        }));

        showMessage('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
        setLoading(false);
    }
});

document.getElementById('email').addEventListener('input', () => {
    document.getElementById('loginMessage').innerHTML = '';
});

document.getElementById('password').addEventListener('input', () => {
    document.getElementById('loginMessage').innerHTML = '';
});