document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedRooms();
});

async function loadFeaturedRooms() {
    const container = document.getElementById('featuredRooms');
    
    try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        
        if (data.success && data.data.rooms.length > 0) {
            const featuredRooms = data.data.rooms.slice(0, 3);
            
            container.innerHTML = featuredRooms.map(room => `
                <div class="room-card">
                    <div class="room-image">
                        <i class="fas fa-bed"></i>
                    </div>
                    <div class="room-info">
                        <h3>${room.name}</h3>
                        <p class="room-type">${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room</p>
                        <p class="room-price">₹${room.price}<span>/night</span></p>
                        <p class="room-capacity"><i class="fas fa-users"></i> ${room.capacity} Guests</p>
                        <a href="/rooms" class="btn btn-secondary">View Details</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading featured rooms:', error);
    }
}
