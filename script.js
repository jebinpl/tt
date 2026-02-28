// ================= ELEMENTS =================
const adminBtn = document.getElementById('adminBtn');
const adminPanel = document.getElementById('adminPanel');
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const homeBtn = document.getElementById('homeBtn');
const homeDropup = document.getElementById('homeDropup');
const welcomeMessage = document.getElementById('welcomeMessage');
const customerModal = document.getElementById('customerModal');
const closeCustomerModal = document.getElementById('closeCustomerModal');

// ================= ADMIN PANEL =================
adminBtn.addEventListener('click', () => {
    adminPanel.style.display = adminPanel.style.display === 'block' ? 'none' : 'block';
});

// ================= MENU DROPDOWN =================
menuBtn.addEventListener('click', () => {
    menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
});

// Close menu if clicked outside
document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
        menuDropdown.style.display = 'none';
    }
});

// ================= HOME DROPUP =================
homeBtn.addEventListener('click', () => {
    homeDropup.classList.toggle('show');
});

// ================= WELCOME MESSAGE =================
function showWelcome(msg) {
    welcomeMessage.textContent = msg;
    welcomeMessage.classList.add('show');
    setTimeout(() => {
        welcomeMessage.classList.remove('show');
    }, 3000);
}

// Example: show welcome on page load
window.addEventListener('load', () => {
    showWelcome('Welcome back!');
});

// ================= CUSTOMER MODAL =================
adminBtn.addEventListener('dblclick', () => {
    customerModal.style.display = 'flex';
});

closeCustomerModal.addEventListener('click', () => {
    customerModal.style.display = 'none';
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === customerModal) {
        customerModal.style.display = 'none';
    }
});
