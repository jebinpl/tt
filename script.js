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
/*-------------------------------------------------------------------------------------------------*/
/* ================= CUSTOMER MODAL ================= */
const customerLink = document.getElementById("customerLink");
const customerModal = document.getElementById("customerModal");
const closeCustomer = document.getElementById("closeCustomer");
const getOtpBtn = document.getElementById("getOtpBtn");
const phoneSection = document.getElementById("phoneSection");
const otpSection = document.getElementById("otpSection");

customerLink.addEventListener("click", function(e) {
    e.preventDefault();
    customerModal.style.display = "block";
    dropdown.style.display = "none";
});

closeCustomer.addEventListener("click", function() {
    customerModal.style.display = "none";

    // Reset back to phone section when closing
    phoneSection.style.display = "block";
    otpSection.style.display = "none";
});

getOtpBtn.addEventListener("click", function() {
    phoneSection.style.display = "none";
    otpSection.style.display = "block";
});


/* ================= CLOSE MODAL WHEN CLICK OUTSIDE ================= */

window.addEventListener("click", function(e) {

    // Close Admin Modal
    if (e.target === adminModal) {
        adminModal.style.display = "none";
    }

    // Close Customer Modal
    if (e.target === customerModal) {
        customerModal.style.display = "none";
        phoneSection.style.display = "block";
        otpSection.style.display = "none";
    }
});


