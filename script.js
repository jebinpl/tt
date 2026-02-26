
const loginBtn = document.querySelector('.login-btn');
const dropdown = document.querySelector('.dropdown-content');

loginBtn.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Optional: close dropdown if click outside
window.addEventListener('click', (e) => {
    if (!e.target.matches('.login-btn')) {
        dropdown.style.display = 'none';
    }
});
