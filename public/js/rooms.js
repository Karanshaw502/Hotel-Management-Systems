document.addEventListener('DOMContentLoaded', function () {
    loadRooms();

    document.getElementById('typeFilter').addEventListener('change', loadRooms);
    document.getElementById('statusFilter').addEventListener('change', loadRooms);
});

async function loadRooms() {
    const container = document.getElementById('roomsContainer');
    container.innerHTML = '<div class="loading">Loading rooms...</div>';

    try {
        const type = document.getElementById('typeFilter').value;
        const status = document.getElementById('statusFilter').value;

        let url = '/api/rooms?';
        if (type) url += `type=${type}&`;
        if (status) url += `status=${status}&`;

        const response = await fetch(url);
        const result = await response.json();

        // 🔥 SAFE CHECK
        const rooms = result?.data?.rooms || [];

        if (rooms.length > 0) {
            container.innerHTML = rooms.map(room => `
                <div class="room-card">
                    <div class="room-image">
                        <i class="fas fa-bed"></i>
                    </div>

                    <div class="room-info">
                        <div class="room-header">
                            <h3>${room.name}</h3>
                            <span class="status-badge status-${room.status}">${room.status}</span>
                        </div>

                        <p class="room-type">${room.type}</p>
                        <p class="room-number">Room ${room.roomNumber || "N/A"}</p>
                        <p class="room-price">₹${room.price}/night</p>
                        <p class="room-capacity">Up to ${room.capacity} guests</p>

                        ${room.amenities?.length
                            ? `<div class="room-amenities">
                                ${room.amenities.slice(0, 4).map(a =>
                                `<span class="amenity-tag">${a}</span>`
                            ).join('')}
                               </div>`
                            : ''
                        }

                        ${room.status === 'available'
                            ? `<a href="/booking?room=${room._id}" class="btn btn-primary">Book Now</a>`
                            : `<button class="btn btn-secondary" disabled>Not Available</button>`
                        }
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="loading">No rooms found</div>';
        }

    } catch (error) {
        console.error('Error loading rooms:', error);
        container.innerHTML = '<div class="loading">Error loading rooms. Please try again.</div>';
    }
}
