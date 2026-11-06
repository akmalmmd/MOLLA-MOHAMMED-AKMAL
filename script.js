// Client-side interactions for Online Hotel Booking System
const API_BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('hotel_jwt_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('hotel_user');
  return user ? JSON.parse(user) : null;
}

function setAuth(token, user) {
  localStorage.setItem('hotel_jwt_token', token);
  localStorage.setItem('hotel_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('hotel_jwt_token');
  localStorage.removeItem('hotel_user');
  window.location.reload();
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
    ...options.headers
  };
  const response = await fetch(API_BASE + endpoint, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

function updateNavAuth() {
  const user = getCurrentUser();
  const authNav = document.getElementById('authNavItem');
  if (!authNav) return;

  if (user) {
    authNav.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <span style="color:#cbd5e1; font-size:0.85rem;">Hello, <strong>${user.name}</strong></span>
        <button onclick="clearAuth()" class="btn-primary" style="padding:0.4rem 0.8rem; font-size:0.8rem; background:#dc2626;">Sign Out</button>
      </div>
    `;
  } else {
    authNav.innerHTML = `<a href="login.html" class="btn-primary">Sign In</a>`;
  }
}

async function initHomePage() {
  updateNavAuth();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const inElem = document.getElementById('checkIn');
  const outElem = document.getElementById('checkOut');
  if (inElem) inElem.value = today;
  if (outElem) outElem.value = tomorrow;

  loadFeaturedRooms();
}

async function loadFeaturedRooms() {
  try {
    const data = await apiRequest('/rooms');
    const container = document.getElementById('roomContainer');
    if (!container) return;
    container.innerHTML = data.rooms.map(room => `
      <div class="room-card">
        <img src="${room.image_url}" alt="${room.room_type}">
        <div class="room-card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span class="badge ${room.status === 'Available' ? 'badge-available' : 'badge-maintenance'}">${room.status}</span>
            <span style="font-weight:600; color:var(--text-muted); font-size:0.85rem;">Room #${room.room_number}</span>
          </div>
          <h3 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem;">${room.room_type}</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; flex:1; margin-bottom:1rem; line-height:1.5;">${room.description}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:1rem;">
            <div>
              <span class="room-price">$${Number(room.price).toLocaleString()}</span>
              <span style="font-size:0.8rem; color:var(--text-muted);">/ night</span>
            </div>
            <a href="rooms.html?id=${room.id}" class="btn-primary">Book Now</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load rooms:', err);
  }
}

function searchRooms() {
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const roomType = document.getElementById('roomType').value;
  const guests = document.getElementById('guests').value;

  window.location.href = `rooms.html?in=${checkIn}&out=${checkOut}&type=${encodeURIComponent(roomType)}&guests=${guests}`;
}
