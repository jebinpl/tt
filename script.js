const loginBtn = document.querySelector('.login-btn');
const dropdown = document.querySelector('.dropdown');

loginBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.style.display =
        dropdown.style.display === 'block' ? 'none' : 'block';
});

window.addEventListener('click', function () {
    dropdown.style.display = 'none';
});
