const API_BASE_URL = 'http://localhost:4000';

// State
let authToken = localStorage.getItem('adminToken');

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const pendingDrivers = document.getElementById('pendingDrivers');
const pendingCount = document.getElementById('pendingCount');
const approvedCount = document.getElementById('approvedCount');

// API Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        const text = await response.text();
        let data;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('Invalid JSON response');
            }
        } else {
            data = {};
        }
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginError.textContent = '';
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response.user?.role !== 'ADMIN') {
            throw new Error('Access denied. Admin only.');
        }
        
        authToken = response.session.access_token;
        localStorage.setItem('adminToken', authToken);
        
        showDashboard();
    } catch (error) {
        loginError.textContent = error.message;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
});

// Show Screens
function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    loadPendingDrivers();
}

// Load Pending Drivers
async function loadPendingDrivers() {
    pendingDrivers.innerHTML = '<p class="loading">Loading...</p>';
    
    try {
        const drivers = await apiRequest('/drivers/pending');
        
        pendingCount.textContent = drivers.length;
        approvedCount.textContent = '0'; // Would need separate endpoint for approved count
        
        if (drivers.length === 0) {
            pendingDrivers.innerHTML = '<p class="no-drivers">No pending driver approvals</p>';
            return;
        }
        
        pendingDrivers.innerHTML = drivers.map(driver => `
            <div class="driver-card">
                <div class="driver-info">
                    <h4>${driver.user?.fullName || 'Unknown'}</h4>
                    <p class="email">${driver.user?.email || 'No email'}</p>
                    <p>National ID: ${driver.nationalId || 'Not provided'}</p>
                    <p>License: ${driver.driversLicense || 'Not provided'}</p>
                </div>
                <div class="driver-actions">
                    <button class="approve-btn" onclick="approveDriver('${driver.id}')">Approve</button>
                    <button class="reject-btn" onclick="rejectDriver('${driver.id}')">Reject</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        pendingDrivers.innerHTML = `<p class="error">Error loading drivers: ${error.message}</p>`;
    }
}

// Approve Driver
async function approveDriver(driverProfileId) {
    try {
        await apiRequest(`/drivers/${driverProfileId}/approve`, {
            method: 'PATCH',
        });
        loadPendingDrivers();
    } catch (error) {
        alert(`Error approving driver: ${error.message}`);
    }
}

// Reject Driver
async function rejectDriver(driverProfileId) {
    if (!confirm('Are you sure you want to reject this driver application?')) {
        return;
    }
    
    try {
        await apiRequest(`/drivers/${driverProfileId}/reject`, {
            method: 'PATCH',
        });
        loadPendingDrivers();
    } catch (error) {
        alert(`Error rejecting driver: ${error.message}`);
    }
}

// Check auth on load
if (authToken) {
    showDashboard();
} else {
    showLogin();
}
