const API_BASE_URL = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function isAdmin() {
    const user = getUser();
    return user && user.role === 'admin';
}

function setAuthUI() {
    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    const adminLink = document.getElementById('adminLink');
    const userName = document.getElementById('userName');

    if (isLoggedIn()) {
        if (authLinks) authLinks.style.display = 'none';
        if (userLinks) userLinks.style.display = 'flex';
        if (userName) userName.textContent = getUser().name;
        
        if (isAdmin() && adminLink) {
            adminLink.style.display = 'block';
        }
    } else {
        if (authLinks) authLinks.style.display = 'flex';
        if (userLinks) userLinks.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: getAuthHeaders()
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                logout();
            }
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    return alertDiv;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    
    if (checkIn) checkIn.min = today;
    if (checkOut) checkOut.min = today;
    
    if (checkIn && checkOut) {
        checkIn.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            checkInDate.setDate(checkInDate.getDate() + 1);
            checkOut.min = checkInDate.toISOString().split('T')[0];
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setAuthUI();
});
