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
/*-----------------------------------------------------------------------------*/
const adminLink = document.getElementById("adminLink");
const adminModal = document.getElementById("adminModal");
const closeAdmin = document.getElementById("closeAdmin");

adminLink.addEventListener("click", function(e) {
    e.preventDefault();
    adminModal.style.display = "block";
});

closeAdmin.addEventListener("click", function() {
    adminModal.style.display = "none";
});

window.addEventListener("click", function(e) {
    if (e.target === adminModal) {
        adminModal.style.display = "none";
    }
});

