// ================= FIREBASE IMPORTS =================

import { db } from "./firebase.js";

import { 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let isAdmin = false;
/*------------------------------------------------------------------------------------------------*/
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

// ================= LOCAL ADMIN LOGIN =================

let isAdmin = false;

const adminLoginBtn = document.getElementById("adminLoginBtn");

adminLoginBtn.addEventListener("click", function(){

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if(email === "admin@gmail.com" && password === "Admin@123"){

        isAdmin = true;

        adminModal.style.display = "none";
        document.getElementById("adminPanel").style.display = "block";

        alert("Admin Login Successful");

        location.reload(); // refresh to show delete buttons

    } else {
        alert("Invalid Email or Password");
    }

});

// ================= ADD PRODUCT =================

const addProductBtn = document.getElementById("addProductBtn");

addProductBtn.addEventListener("click", async function(){

    const category = document.getElementById("productCategory").value;
    const image = document.getElementById("productImage").value;
    const description = document.getElementById("productDescription").value;
    const price = document.getElementById("productPrice").value;

    if(!category || !image || !description || !price){
        alert("Fill all fields");
        return;
    }

    try {

        await addDoc(collection(db, "products"), {
            category: category,
            image: image,
            description: description,
            price: parseFloat(price)
        });

        alert("Product Added Successfully");

    } catch (error) {
        alert(error.message);
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

/* Open Customer Modal */
customerLink.addEventListener("click", function (e) {
    e.preventDefault();
    customerModal.style.display = "flex";
});

/* Close Customer Modal */
closeCustomer.addEventListener("click", function () {
    customerModal.style.display = "none";

    // Reset to phone section when closing
    phoneSection.style.display = "block";
    otpSection.style.display = "none";
});

/* Show OTP Section */
getOtpBtn.addEventListener("click", function () {
    phoneSection.style.display = "none";
    otpSection.style.display = "block";

    // Focus first OTP box automatically
    document.querySelector(".otp-boxes input").focus();
});

/* Close when clicking outside modal */
window.addEventListener("click", function (e) {
    if (e.target === customerModal) {
        customerModal.style.display = "none";

        phoneSection.style.display = "block";
        otpSection.style.display = "none";
    }
});

/* ================= OTP AUTO MOVE ================= */

const otpInputs = document.querySelectorAll(".otp-boxes input");

otpInputs.forEach((input, index) => {

    input.addEventListener("input", function () {

        // Allow only numbers
        this.value = this.value.replace(/[^0-9]/g, '');

        // Move to next box
        if (this.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    // Move back on backspace
    input.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && this.value === "" && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

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
/* ================= CART SYSTEM ================= */

const cartLink = document.getElementById("cartLink");
const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

let cart = [];

/* Open Cart */
cartLink.addEventListener("click", function(e){
    e.preventDefault();
    cartModal.style.display = "flex";
});

/* Close Cart */
closeCart.addEventListener("click", function(){
    cartModal.style.display = "none";
});

/* Add To Cart */
function addToCart(name, price){
    cart.push({ name, price });
    updateCart();
}

/* Update Cart UI */
function updateCart(){

    cartItemsContainer.innerHTML = "";

    if(cart.length === 0){
        cartItemsContainer.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
        cartCount.textContent = 0;
        cartTotal.textContent = 0;
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {

        total += item.price;

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        itemDiv.innerHTML = `
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <button class="remove-btn" onclick="removeItem(${index})">X</button>
        `;

        cartItemsContainer.appendChild(itemDiv);
    });

    cartCount.textContent = cart.length;
    cartTotal.textContent = total;
}

/* Remove Item */
function removeItem(index){
    cart.splice(index,1);
    updateCart();
}
/*----------------------------------------------------------------*/
function goHome() {

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    // Show welcome message
    const message = document.getElementById("welcomeMessage");
    message.classList.add("show");

    setTimeout(function() {
        message.classList.remove("show");
    }, 2000);

    // 🎙 Voice Welcome
    if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(
            "Welcome to Thomas Traders Online Shopping Portal."
        );

        speech.lang = "en-IN";
        speech.rate = 1;
        speech.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        speech.voice = voices.find(v => v.lang === "en-IN") || voices[0];

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    }

    // ✅ Always SHOW dropup (not toggle)
    const dropup = document.getElementById("homeDropup");
    dropup.classList.add("show");
}
document.addEventListener("click", function (e) {

    const dropup = document.getElementById("homeDropup");
    const homeBtn = document.querySelector(".home-btn");

    if (!dropup.contains(e.target) && !homeBtn.contains(e.target)) {
        dropup.classList.remove("show");
    }
});
/*----------------------------------------------------------------------------------------------------------------------------*/
function toggleMenu() {
    const menu = document.getElementById("menuDropdown");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}
let scrollTimeout;
let lastScrollY = window.scrollY;

window.addEventListener("scroll", function () {

    const searchBar = document.getElementById("searchBar");

    // Hide while scrolling down
    if (window.scrollY > lastScrollY) {
        searchBar.style.transform = "translateY(-100%)";
    }

    lastScrollY = window.scrollY;

    // Show again when scrolling stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
        searchBar.style.transform = "translateY(0)";
    }, 200);
});
// ================= LOAD PRODUCTS =================

const productsContainer = document.getElementById("productsContainer");

onSnapshot(collection(db, "products"), (snapshot) => {

    productsContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {

        const p = docSnap.data();
        const id = docSnap.id;

        const div = document.createElement("div");
        div.classList.add("product-card");

        div.innerHTML = `
            <img src="${p.image}">
            <h4>${p.description}</h4>
            <p>₹${p.price}</p>
            <small>${p.category}</small>
            ${isAdmin ? `<button onclick="deleteProduct('${id}')">Delete</button>` : ""}
            <button onclick="addToCart('${p.description}', ${p.price})">Buy Now</button>
        `;

        productsContainer.appendChild(div);
    });

});
// ================= DELETE PRODUCT =================

async function deleteProduct(id){
    await deleteDoc(doc(db, "products", id));
}
// Make functions global for HTML onclick

window.goHome = goHome;
window.toggleMenu = toggleMenu;
window.removeItem = removeItem;
window.addToCart = addToCart;
window.deleteProduct = deleteProduct;












