const API = '/api';
const token = () => localStorage.getItem('hotelToken');
const user = () => JSON.parse(localStorage.getItem('hotelUser') || 'null');
const money = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(message, type='success', target='message') {
  const el = document.getElementById(target);
  if (el) { el.className = `notice ${type}`; el.textContent = message; el.classList.remove('hidden'); }
}
async function api(path, options={}) {
  const headers = { 'Content-Type':'application/json', ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(API + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
function logout(){localStorage.removeItem('hotelToken');localStorage.removeItem('hotelUser');location.href='/';}
function nav(){
  const u=user(); const slot=document.getElementById('nav-links'); if(!slot)return;
  slot.innerHTML = u
    ? `<span class="nav-user">Hello, ${esc(u.name)}</span><a href="/rooms.html">Rooms</a>${u.role==='admin'?'<a href="/admin.html">Admin</a>':'<a href="/my-bookings.html">My Bookings</a>'}<a href="#" id="logoutLink">Logout</a>`
    : `<a href="/rooms.html">Rooms</a><a href="/login.html">Login</a><a class="btn gold small" href="/register.html">Register</a>`;
  document.getElementById('logoutLink')?.addEventListener('click',e=>{e.preventDefault();logout();});
}
function requireRole(role){const u=user();if(!u||u.role!==role){location.href='/login.html';return false;}return true;}
function roomCard(r){
  const image=r.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900';
  return `<article class="room-card"><img src="${esc(image)}" alt="${esc(r.room_type)}" onerror="this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900'"><div class="room-body"><h3>${esc(r.room_type)}</h3><div class="muted">Room ${esc(r.room_number)}</div><p>${esc(r.description||'A comfortable stay with thoughtful amenities.')}</p><div class="room-meta"><span>👥 ${r.capacity} guest(s)</span><span class="status">${esc(r.status)}</span></div><div class="room-actions"><div class="price">${money(r.price)} <small>/ night</small></div><button class="small" onclick="showBooking(${r.id})">Book now</button></div><form id="book-form-${r.id}" class="booking-inline hidden" onsubmit="submitRoomBooking(event,${r.id})"><div class="field"><label>Check-in</label><input type="date" name="check_in" required></div><div class="field"><label>Check-out</label><input type="date" name="check_out" required></div><div class="field"><label>Guests (max ${r.capacity})</label><input type="number" name="guests" min="1" max="${r.capacity}" value="1" required></div><button type="submit" class="small">Confirm booking</button><button type="button" class="small light" onclick="document.getElementById('book-form-${r.id}').classList.add('hidden')">Close</button><div id="book-message-${r.id}" class="hidden"></div></form></div></article>`;
}
function showBooking(id){
  if(!token() || !user() || user().role!=='customer'){location.href='/login.html';return;}
  const form=document.getElementById(`book-form-${id}`);
  form.classList.remove('hidden');
  const today=new Date().toISOString().slice(0,10);
  const checkin=form.elements.check_in, checkout=form.elements.check_out;
  checkin.min=today; checkout.min=today;
  checkin.addEventListener('change',()=>{checkout.min=checkin.value; if(checkout.value && checkout.value<=checkin.value)checkout.value='';},{once:true});
}
async function submitRoomBooking(event,id){
  event.preventDefault();
  const form=event.currentTarget;
  const data=Object.fromEntries(new FormData(form));
  const message=document.getElementById(`book-message-${id}`);
  try{
    const result=await api('/bookings',{method:'POST',body:JSON.stringify({...data,room_id:id})});
    message.className='notice success';message.textContent=`${result.message} Booking #${result.bookingId}. Total: ${money(result.total_price)} for ${result.nights} night(s).`;
    message.classList.remove('hidden');form.reset();
  }catch(err){message.className='notice error';message.textContent=err.message;message.classList.remove('hidden');}
}
async function loadRooms(query=''){
  const target=document.getElementById('room-list'); if(!target)return;
  try{const rooms=await api('/rooms/available'+query);target.innerHTML=rooms.length?rooms.map(roomCard).join(''):'<div class="empty">No rooms match your search. Try different dates or filters.</div>';}
  catch(e){target.innerHTML=`<div class="notice error">${esc(e.message)}</div>`;}
}
function initSearch(){
  const form=document.getElementById('room-search'); if(!form)return;
  form.addEventListener('submit',e=>{
    e.preventDefault();const d=new FormData(form);const q=new URLSearchParams();
    for(const [k,v] of d.entries())if(v)q.set(k,v);
    loadRooms('?' + q.toString());
  });
  loadRooms();
}
function initAuth(){
  const login=document.getElementById('login-form');
  if(login)login.addEventListener('submit',async e=>{
    e.preventDefault();try{
      const data=await api('/customers/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(login)))});
      localStorage.setItem('hotelToken',data.token);localStorage.setItem('hotelUser',JSON.stringify(data.user));
      location.href=data.user.role==='admin'?'/admin.html':'/rooms.html';
    }catch(err){notice(err.message,'error');}
  });
  const register=document.getElementById('register-form');
  if(register)register.addEventListener('submit',async e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(register));
    if(d.password!==d.confirm_password)return notice('Passwords do not match.','error');
    delete d.confirm_password;
    try{const result=await api('/customers/register',{method:'POST',body:JSON.stringify(d)});notice(result.message);register.reset();}
    catch(err){notice(err.message,'error');}
  });
}
async function initBookings(){
  if(!requireRole('customer'))return;
  const target=document.getElementById('booking-list');if(!target)return;
  try{
    const rows=await api(`/customers/${user().id}/bookings`);
    target.innerHTML=rows.length?`<div class="table-wrap"><table><thead><tr><th>Booking</th><th>Room</th><th>Dates</th><th>Guests</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(b=>`<tr><td>#${b.id}</td><td>${esc(b.room_type)} (${esc(b.room_number)})</td><td>${esc(b.check_in)} → ${esc(b.check_out)}</td><td>${b.guests}</td><td>${money(b.total_price)}</td><td><span class="status ${b.booking_status}">${b.booking_status}</span></td><td>${b.booking_status==='Confirmed'?`<button class="danger small" onclick="cancelBooking(${b.id})">Cancel</button>`:`—`}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">You have no bookings yet. <a href="/rooms.html">Explore rooms</a>.</div>';
  }catch(e){target.innerHTML=`<div class="notice error">${esc(e.message)}</div>`;}
}
async function cancelBooking(id){if(!confirm('Cancel this reservation?'))return;try{const r=await api(`/bookings/${id}/cancel`,{method:'PUT'});alert(r.message);initBookings();}catch(e){alert(e.message);}}
async function initAdmin(){
  if(!requireRole('admin'))return;
  try{
    const s=await api('/dashboard');
    document.getElementById('stats').innerHTML=Object.entries({'Total Customers':s.totalCustomers,'Total Rooms':s.totalRooms,'Available Rooms':s.availableRooms,'Total Bookings':s.totalBookings,'Confirmed Bookings':s.confirmedBookings,'Cancelled Bookings':s.cancelledBookings}).map(([k,v])=>`<div class="stat"><span>${k}</span><strong>${v}</strong></div>`).join('');
    await adminRooms();await adminBookings();
  }catch(e){notice(e.message,'error','admin-message');}
  const form=document.getElementById('room-form');
  form?.addEventListener('submit',async e=>{
    e.preventDefault();const d=Object.fromEntries(new FormData(form));const id=d.id;delete d.id;
    try{const r=await api(id?`/rooms/${id}`:'/rooms',{method:id?'PUT':'POST',body:JSON.stringify(d)});notice(r.message,'success','admin-message');form.reset();document.getElementById('room-form-title').textContent='Add a room';await adminRooms();}
    catch(err){notice(err.message,'error','admin-message');}
  });
}
async function adminRooms(){
  const rows=await api('/rooms');
  document.getElementById('admin-rooms').innerHTML=`<div class="table-wrap"><table><thead><tr><th>Room</th><th>Type</th><th>Price</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.room_number)}</td><td>${esc(r.room_type)}</td><td>${money(r.price)}</td><td>${r.capacity}</td><td>${r.status}</td><td><button class="small light" onclick='editRoom(${JSON.stringify(r).replace(/'/g,"&#39;")})'>Edit</button> <button class="small danger" onclick="deleteRoom(${r.id})">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
}
function editRoom(r){
  const f=document.getElementById('room-form');
  for(const key of ['id','room_number','room_type','description','price','capacity','image_url','status'])if(f.elements[key])f.elements[key].value=r[key]??'';
  document.getElementById('room-form-title').textContent='Edit room';
  window.scrollTo({top:0,behavior:'smooth'});
}
async function deleteRoom(id){if(!confirm('Delete this room? Rooms with booking history cannot be deleted.'))return;try{const r=await api(`/rooms/${id}`,{method:'DELETE'});notice(r.message,'success','admin-message');await adminRooms();}catch(e){notice(e.message,'error','admin-message');}}
async function adminBookings(){
  const rows=await api('/bookings');
  document.getElementById('admin-bookings').innerHTML=`<div class="table-wrap"><table><thead><tr><th>ID</th><th>Customer</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>${rows.map(b=>`<tr><td>#${b.id}</td><td>${esc(b.customer_name)}<br><small>${esc(b.customer_email)}</small></td><td>${esc(b.room_number)} / ${esc(b.room_type)}</td><td>${esc(b.check_in)} → ${esc(b.check_out)}</td><td>${money(b.total_price)}</td><td>${b.booking_status}</td><td><select onchange="updateBooking(${b.id},this.value)"><option ${b.booking_status==='Confirmed'?'selected':''}>Confirmed</option><option ${b.booking_status==='Cancelled'?'selected':''}>Cancelled</option><option ${b.booking_status==='Completed'?'selected':''}>Completed</option></select></td></tr>`).join('')}</tbody></table></div>`;
}
async function updateBooking(id,status){try{const r=await api(`/bookings/${id}/status`,{method:'PUT',body:JSON.stringify({booking_status:status})});notice(r.message,'success','admin-message');await adminBookings();}catch(e){notice(e.message,'error','admin-message');await adminBookings();}}
document.addEventListener('DOMContentLoaded',()=>{nav();initSearch();initAuth();initBookings();initAdmin();});
