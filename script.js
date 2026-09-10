document.addEventListener('DOMContentLoaded', () => {
  renderAuthHeader();
});

function renderAuthHeader() {
  const slot = document.getElementById('navUserSlot');
  if (!slot) return;

  const rawUser = localStorage.getItem('astro_logged_client');
  if (!rawUser) {
    slot.innerHTML = `<a href="auth.html" class="nav-btn-auth"><i class="fa-regular fa-user"></i> Login</a>`;
    return;
  }

  const user = JSON.parse(rawUser);
  const name = user.name ? user.name.split(' ')[0] : 'User';

  // কমপ্যাক্ট ড্রপডাউন স্ট্রাকচার যা ন্যাভবারকে বড় করবে না
  slot.innerHTML = `
    <div class="user-chip-wrapper">
      <button type="button" class="user-chip-btn" onclick="toggleUserMenu(event)">
        <span class="user-avatar">${name.charAt(0).toUpperCase()}</span>
        <span class="user-name-text">${name}</span>
        <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>
      </button>
      <div class="user-dropdown-card" id="userDropCard">
        <a href="dashboard.html"><i class="fa-solid fa-box-archive"></i> My Orders</a>
        <a href="javascript:void(0)" onclick="clientSignOut()"><i class="fa-solid fa-power-off"></i> Sign Out</a>
      </div>
    </div>
  `;
}

function toggleUserMenu(e) {
  e.stopPropagation();
  const card = document.getElementById('userDropCard');
  if (card) {
    card.style.display = card.style.display === 'block' ? 'none' : 'block';
  }
}

document.addEventListener('click', () => {
  const card = document.getElementById('userDropCard');
  if (card) card.style.display = 'none';
});

function clientSignOut() {
  localStorage.removeItem('astro_logged_client');
  alert('Signed out successfully.');
  window.location.reload();
}