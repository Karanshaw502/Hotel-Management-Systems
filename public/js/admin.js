document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    setupSidebar();
    loadDashboard();
});

function checkAdminAccess() {
    if (!isLoggedIn() || !isAdmin()) {
        window.location.href = '/login';
        return;
    }
    
    const adminName = document.getElementById('adminName');
    if (adminName) {
        const user = getUser();
        adminName.textContent = user ? user.name : 'Admin';
    }
}

function setupSidebar() {
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const sections = document.querySelectorAll('.admin-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            
            if (!section) return;
            
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(s => s.style.display = 'none');
            
            const targetSection = document.getElementById(`${section}Section`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
            }
            
            switch(section) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'rooms':
                    loadRooms();
                    break;
                case 'bookings':
                    loadBookings();
                    break;
                case 'users':
                    loadUsers();
                    break;
            }
        });
    });
    
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

async function loadDashboard() {
    try {
        const data = await apiRequest('/admin/stats');
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.data.stats.users.total;
            document.getElementById('totalRooms').textContent = data.data.stats.rooms.total;
            document.getElementById('totalBookings').textContent = data.data.stats.bookings.total;
            document.getElementById('availableRooms').textContent = data.data.stats.rooms.available;
            
            renderRecentBookings(data.data.recentBookings);
            renderRecentUsers(data.data.recentUsers);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderRecentBookings(bookings) {
    const container = document.getElementById('recentBookings');
    
    if (bookings && bookings.length > 0) {
        container.innerHTML = bookings.map(b => `
            <div class="recent-item">
                <div class="recent-item-header">
                    <strong>${b.user ? b.user.name : 'User'}</strong>
                    <span class="status-badge status-${b.status}">${b.status}</span>
                </div>
                <p>Room: ${b.room ? b.room.roomNumber : 'N/A'} - $${b.totalPrice}</p>
                <p>${formatDate(b.checkInDate)} - ${formatDate(b.checkOutDate)}</p>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p>No recent bookings</p>';
    }
}

function renderRecentUsers(users) {
    const container = document.getElementById('recentUsers');
    
    if (users && users.length > 0) {
        container.innerHTML = users.map(u => `
            <div class="recent-item">
                <div class="recent-item-header">
                    <strong>${u.name}</strong>
                    <span>${u.role}</span>
                </div>
                <p>${u.email}</p>
                <p>Joined: ${formatDate(u.createdAt)}</p>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p>No recent users</p>';
    }
}

async function loadRooms() {
    const tbody = document.getElementById('roomsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';
    
    try {
        const data = await apiRequest('/rooms');
        
        if (data.success) {
            tbody.innerHTML = data.data.rooms.map(room => `
                <tr>
                    <td>${room.roomNumber}</td>
                    <td>${room.name}</td>
                    <td>${room.type}</td>
                    <td>$${room.price}</td>
                    <td>${room.capacity}</td>
                    <td><span class="status-badge status-${room.status}">${room.status}</span></td>
                    <td>
                        <div class="action-btns">
                            <button onclick="editRoom('${room._id}')" class="action-btn edit">Edit</button>
                            <button onclick="deleteRoom('${room._id}')" class="action-btn delete">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading rooms</td></tr>';
    }
}

function showRoomModal(room = null) {
    const modal = document.getElementById('roomModal');
    const title = document.getElementById('roomModalTitle');
    const form = document.getElementById('roomForm');
    
    if (room) {
        title.textContent = 'Edit Room';
        document.getElementById('roomId').value = room._id;
        document.getElementById('roomNumber').value = room.roomNumber;
        document.getElementById('roomName').value = room.name;
        document.getElementById('roomType').value = room.type;
        document.getElementById('roomPrice').value = room.price;
        document.getElementById('roomCapacity').value = room.capacity;
        document.getElementById('roomFloor').value = room.floor || 1;
        document.getElementById('roomDescription').value = room.description || '';
        document.getElementById('roomAmenities').value = room.amenities ? room.amenities.join(', ') : '';
    } else {
        title.textContent = 'Add Room';
        form.reset();
        document.getElementById('roomId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeRoomModal() {
    document.getElementById('roomModal').style.display = 'none';
}

async function editRoom(roomId) {
    try {
        const data = await apiRequest(`/rooms/${roomId}`);
        if (data.success) {
            showRoomModal(data.data.room);
        }
    } catch (error) {
        console.error('Error loading room:', error);
    }
}

document.getElementById('roomForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const roomId = document.getElementById('roomId').value;
    const roomData = {
        roomNumber: document.getElementById('roomNumber').value,
        name: document.getElementById('roomName').value,
        type: document.getElementById('roomType').value,
        price: parseInt(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        floor: parseInt(document.getElementById('roomFloor').value),
        description: document.getElementById('roomDescription').value,
        amenities: document.getElementById('roomAmenities').value.split(',').map(a => a.trim()).filter(a => a)
    };
    
    try {
        let data;
        if (roomId) {
            data = await apiRequest(`/rooms/${roomId}`, 'PUT', roomData);
        } else {
            data = await apiRequest('/rooms', 'POST', roomData);
        }
        
        if (data.success) {
            closeRoomModal();
            loadRooms();
            alert(roomId ? 'Room updated successfully' : 'Room created successfully');
        }
    } catch (error) {
        alert(error.message || 'Error saving room');
    }
});

function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    apiRequest(`/rooms/${roomId}`, 'DELETE')
        .then(data => {
            if (data.success) {
                loadRooms();
                alert('Room deleted successfully');
            }
        })
        .catch(error => {
            alert(error.message || 'Error deleting room');
        });
}

async function loadBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading...</td></tr>';
    
    try {
        const data = await apiRequest('/admin/bookings');
        
        if (data.success) {
            tbody.innerHTML = data.data.bookings.map(booking => `
                <tr>
                    <td>${booking._id.slice(-6)}</td>
                    <td>${booking.user ? booking.user.name : 'N/A'}<br><small>${booking.user ? booking.user.email : ''}</small></td>
                    <td>${booking.room ? booking.room.name : 'N/A'}<br><small>Room ${booking.room ? booking.room.roomNumber : ''}</small></td>
                    <td>${formatDate(booking.checkInDate)}</td>
                    <td>${formatDate(booking.checkOutDate)}</td>
                    <td>$${booking.totalPrice}</td>
                    <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                    <td>
                        <div class="action-btns">
                            <select onchange="updateBookingStatus('${booking._id}', this.value)" class="status-select">
                                <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="checked-in" ${booking.status === 'checked-in' ? 'selected' : ''}>Checked-in</option>
                                <option value="checked-out" ${booking.status === 'checked-out' ? 'selected' : ''}>Checked-out</option>
                                <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Error loading bookings</td></tr>';
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        const data = await apiRequest(`/admin/bookings/${bookingId}`, 'PATCH', { status });
        if (data.success) {
            loadBookings();
            loadDashboard();
        }
    } catch (error) {
        alert(error.message || 'Error updating booking');
    }
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading...</td></tr>';
    
    try {
        const data = await apiRequest('/admin/users');
        
        if (data.success) {
            tbody.innerHTML = data.data.users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.role}</td>
                    <td>
                        <span class="status-badge ${user.isActive ? 'status-confirmed' : 'status-cancelled'}">
                            ${user.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>${formatDate(user.createdAt)}</td>
                    <td>
                        ${user.role !== 'admin' ? `
                            <div class="action-btns">
                                <button onclick="toggleUserStatus('${user._id}')" class="action-btn ${user.isActive ? 'cancel' : 'view'}">
                                    ${user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        ` : '-'}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Error loading users</td></tr>';
    }
}

async function toggleUserStatus(userId) {
    try {
        const data = await apiRequest(`/admin/users/${userId}/toggle-status`, 'PATCH');
        if (data.success) {
            loadUsers();
        }
    } catch (error) {
        alert(error.message || 'Error updating user status');
    }
}

window.onclick = function(event) {
    const roomModal = document.getElementById('roomModal');
    const confirmModal = document.getElementById('confirmModal');
    
    if (event.target === roomModal) {
        closeRoomModal();
    }
    if (event.target === confirmModal) {
        closeConfirmModal();
    }
}
