let selectedRoom = null;
let selectedDates = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndShowContent();
    setupBookingForm();
    loadUserBookings();
    setMinDates();
});

function checkAuthAndShowContent() {
    const loginPrompt = document.getElementById('loginPrompt');
    const bookingContent = document.getElementById('bookingContent');
    
    if (!isLoggedIn()) {
        loginPrompt.style.display = 'block';
        bookingContent.querySelector('.booking-form-container').style.display = 'none';
    } else {
        loginPrompt.style.display = 'none';
    }
}

function setupBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    const completeBookingForm = document.getElementById('completeBookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleSearchRooms);
    }
    
    if (completeBookingForm) {
        completeBookingForm.addEventListener('submit', handleCompleteBooking);
    }
}

async function handleSearchRooms(e) {
    e.preventDefault();
    
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    const roomType = document.getElementById('roomType').value;
    
    if (!checkIn || !checkOut) {
        showBookingAlert('Please select check-in and check-out dates', 'error');
        return;
    }
    
    selectedDates = { checkIn, checkOut, guests };
    
    await searchAvailableRooms(guests, roomType);
}

async function searchAvailableRooms(guests, roomType) {
    const availableRoomsDiv = document.getElementById('availableRooms');
    const roomsList = document.getElementById('roomsList');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.style.display = 'none';
    roomsList.innerHTML = '<div class="loading">Searching for available rooms...</div>';
    availableRoomsDiv.style.display = 'block';
    
    try {
        let url = '/api/rooms/available?';
        if (guests) url += `capacity=${guests}&`;
        if (roomType) url += `type=${roomType}&`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.data.rooms.length > 0) {
            roomsList.innerHTML = data.data.rooms.map(room => `
                <div class="room-card">
                    <div class="room-image">
                        <i class="fas fa-bed"></i>
                    </div>
                    <div class="room-info">
                        <h3>${room.name}</h3>
                        <p class="room-type">${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room - Room ${room.roomNumber}</p>
                        <p class="room-price">₹${room.price}<span>/night</span></p>
                        <p class="room-capacity"><i class="fas fa-users"></i> Up to ${room.capacity} guests</p>
                        ${room.description ? `<p class="room-description">${room.description}</p>` : ''}
                        <button onclick="selectRoom('${room._id}')" class="btn btn-primary">Select Room</button>
                    </div>
                </div>
            `).join('');
        } else {
            roomsList.innerHTML = '<div class="loading">No rooms available for selected criteria</div>';
        }
    } catch (error) {
        console.error('Error searching rooms:', error);
        roomsList.innerHTML = '<div class="loading">Error searching rooms. Please try again.</div>';
    }
}

function selectRoom(roomId) {
    fetch(`/api/rooms/${roomId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                selectedRoom = data.data.room;
                showBookingDetails();
            }
        })
        .catch(err => console.error('Error:', err));
}

function showBookingDetails() {
    const availableRooms = document.getElementById('availableRooms');
    const bookingDetails = document.getElementById('bookingDetails');
    const selectedRoomInfo = document.getElementById('selectedRoomInfo');
    const bookingSummary = document.getElementById('bookingSummary');
    
    availableRooms.style.display = 'none';
    bookingDetails.style.display = 'block';
    
    const checkIn = new Date(selectedDates.checkIn);
    const checkOut = new Date(selectedDates.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * selectedRoom.price;
    
    selectedRoomInfo.innerHTML = `
        <h3>Selected Room</h3>
        <p><strong>${selectedRoom.name}</strong></p>
        <p>Room ${selectedRoom.roomNumber} - ${selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)}</p>
        <p>₹${selectedRoom.price} per night</p>
    `;
    
    bookingSummary.innerHTML = `
        <div class="summary-row">
            <span>Check-in:</span>
            <span>${formatDate(selectedDates.checkIn)}</span>
        </div>
        <div class="summary-row">
            <span>Check-out:</span>
            <span>${formatDate(selectedDates.checkOut)}</span>
        </div>
        <div class="summary-row">
            <span>Number of Nights:</span>
            <span>${nights}</span>
        </div>
        <div class="summary-row">
            <span>Guests:</span>
            <span>${selectedDates.guests}</span>
        </div>
        <div class="summary-row">
            <span>Total Price:</span>
            <span>₹${totalPrice}</span>
        </div>
    `;
}

function cancelBooking() {
    selectedRoom = null;
    selectedDates = null;
    
    document.getElementById('availableRooms').style.display = 'block';
    document.getElementById('bookingDetails').style.display = 'none';
    document.getElementById('bookingForm').reset();
}

async function handleCompleteBooking(e) {
    e.preventDefault();
    
    if (!selectedRoom || !selectedDates) {
        showBookingAlert('Please select a room first', 'error');
        return;
    }
    
    const specialRequests = document.getElementById('specialRequests').value;
    
    try {
        const data = await apiRequest('/bookings', 'POST', {
            roomId: selectedRoom._id,
            checkInDate: selectedDates.checkIn,
            checkOutDate: selectedDates.checkOut,
            guests: parseInt(selectedDates.guests),
            specialRequests: specialRequests
        });
        
        if (data.success) {
            showBookingAlert('Booking created successfully!', 'success');
            
            setTimeout(() => {
                cancelBooking();
                document.getElementById('bookingForm').reset();
                loadUserBookings();
            }, 2000);
        }
    } catch (error) {
        showBookingAlert(error.message || 'Failed to create booking', 'error');
    }
}

async function loadUserBookings() {
    const myBookingsDiv = document.getElementById('myBookings');
    const bookingsList = document.getElementById('bookingsList');
    
    if (!isLoggedIn()) return;
    
    myBookingsDiv.style.display = 'block';
    bookingsList.innerHTML = '<div class="loading">Loading your bookings...</div>';
    
    try {
        const data = await apiRequest('/bookings/my-bookings');
        
        if (data.success && data.data.bookings.length > 0) {
            bookingsList.innerHTML = data.data.bookings.map(booking => `
                <div class="booking-card">
                    <div class="booking-card-header">
                        <h3>${booking.room ? booking.room.name : 'Room'}</h3>
                        <span class="status-badge status-${booking.status}">${booking.status}</span>
                    </div>
                    <div class="booking-card-body">
                        <div class="booking-info-item">
                            <label>Room Number</label>
                            <span>${booking.room ? booking.room.roomNumber : 'N/A'}</span>
                        </div>
                        <div class="booking-info-item">
                            <label>Check-in</label>
                            <span>${formatDate(booking.checkInDate)}</span>
                        </div>
                        <div class="booking-info-item">
                            <label>Check-out</label>
                            <span>${formatDate(booking.checkOutDate)}</span>
                        </div>
                        <div class="booking-info-item">
                            <label>Guests</label>
                            <span>${booking.guests}</span>
                        </div>
                        <div class="booking-info-item">
                            <label>Total Price</label>
                            <span>₹${booking.totalPrice}</span>
                        </div>
                        <div class="booking-info-item">
                            <label>Payment</label>
                            <span>${booking.paymentStatus}</span>
                        </div>
                    </div>
                    ${booking.status !== 'cancelled' && booking.status !== 'checked-out' ? `
                        <div class="booking-card-actions" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                            <button onclick="cancelUserBooking('${booking._id}')" class="btn btn-secondary">Cancel Booking</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        } else {
            bookingsList.innerHTML = '<div class="loading">No bookings found</div>';
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsList.innerHTML = '<div class="loading">Error loading bookings</div>';
    }
}

async function cancelUserBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const data = await apiRequest(`/bookings/${bookingId}/cancel`, 'PATCH');
        
        if (data.success) {
            showBookingAlert('Booking cancelled successfully', 'success');
            loadUserBookings();
        }
    } catch (error) {
        showBookingAlert(error.message || 'Failed to cancel booking', 'error');
    }
}

function showBookingAlert(message, type) {
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.className = `alert alert-${type}`;
    alertMessage.textContent = message;
    alertMessage.style.display = 'block';
    
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}
