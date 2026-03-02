console.log("Script Loaded Successfully");
let editingProductId = null;
// ================= FIREBASE IMPORTS =================

import { db, storage } from "./firebase.js";

import { 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc,
    updateDoc,
    query,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

let isAdmin = localStorage.getItem("isAdmin") === "true";
let currentCategory = "Electricals";
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.querySelector(".login-btn");
const dropdown = document.querySelector(".dropdown");
if (isAdmin) {
    if (loginBtn) loginBtn.textContent = "Admin";
} else {
    if (loginBtn) loginBtn.textContent = "Login";
}
if (adminPanel) {
    adminPanel.style.display = isAdmin ? "block" : "none";
}
/*------------------------------------------Login Button------------------------------------------------------*/

if (loginBtn) {

    // Change text depending on admin status
    loginBtn.textContent = isAdmin ? "Admin" : "Login";

    loginBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.style.display =
            dropdown.style.display === "block" ? "none" : "block";
    });
}

window.addEventListener("click", function () {
    if (dropdown) dropdown.style.display = "none";
});
/*-----------------------------------Admin ------------------------------------------*/
const adminLink = document.getElementById("adminLink");
const adminModal = document.getElementById("adminModal");
const closeAdmin = document.getElementById("closeAdmin");
// Change button text if already logged in
if (adminLink && isAdmin) {
    adminLink.textContent = "Logout";
}
if (adminLink) {
    adminLink.addEventListener("click", function(e) {
        e.preventDefault();

        const isAdminNow = localStorage.getItem("isAdmin") === "true";

        if (isAdminNow) {
            // ✅ Logout
            localStorage.removeItem("isAdmin");
            location.reload();
        } else {
            // ✅ Open login modal
            adminModal.style.display = "block";
        }
    });
}
if (closeAdmin) {
    closeAdmin.addEventListener("click", function() {
        adminModal.style.display = "none";
    });
}

window.addEventListener("click", function(e) {
    if (e.target === adminModal) {
        adminModal.style.display = "none";
    }
});

// ================= LOCAL ADMIN LOGIN =================



const adminLoginBtn = document.getElementById("adminLoginBtn");

if (adminLoginBtn) {
    adminLoginBtn.addEventListener("click", function(){

        const email = document.getElementById("adminEmail").value;
        const password = document.getElementById("adminPassword").value;

        if(email === "admin@gmail.com" && password === "Admin@123"){

            localStorage.setItem("isAdmin", "true");
            adminModal.style.display = "none";
            location.reload();

        } else {
            alert("Invalid Email or Password");
        }

    });
}

// CATEGORY SELECTION FUNCTION
function selectCategory(categoryName) {

    currentCategory = categoryName;
    renderProducts();
    let isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) return;

    // ADMIN UI ONLY BELOW
    const message = document.getElementById("adminMessage");
    const heading = document.getElementById("categoryHeading");
    const controls = document.getElementById("categoryControls");
    const formSection = document.getElementById("addProductSection");

    message.style.display = "none";
    heading.style.display = "block";
    heading.textContent = categoryName;
    controls.style.display = "block";
    formSection.style.display = "none";
}

const addProductsBtn = document.getElementById("addProductsBtn");
const cancelProductBtn = document.getElementById("cancelProductBtn");
const addProductSection = document.getElementById("addProductSection");


if (addProductsBtn) {
    addProductsBtn.addEventListener("click", function () {
        addProductSection.style.display = "block";
    });
}

if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", function () {
        addProductSection.style.display = "none";
    });
}
document.querySelectorAll(".category-link").forEach(link => {
    link.addEventListener("click", function () {
        const category = this.dataset.category;
        selectCategory(category);

        // ✅ Hide menu after selecting category
        const menu = document.getElementById("menuDropdown");
        if (menu) {
            menu.style.display = "none";
        }
    });
});
/* ================= IMAGE AUTO COMPRESS ================= */

async function compressImage(file, maxSizeKB = 300) {
    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = function (event) {

            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                let quality = 0.9;

                function reduceQuality() {
                    canvas.toBlob((blob) => {

                        if (blob.size / 1024 > maxSizeKB && quality > 0.1) {
                            quality -= 0.05;
                            reduceQuality();
                        } else {
                            resolve(blob);
                        }

                    }, "image/jpeg", quality);
                }

                reduceQuality();
            };
        };
    });
}
// ================= ADD PRODUCT =================

const addProductBtn = document.getElementById("addProductBtn");

if (addProductBtn) {
    addProductBtn.addEventListener("click", async function(){

        
        const file = document.getElementById("productImage").files[0];

        const description = document.getElementById("productDescription").value;
        const price = document.getElementById("productPrice").value;

if(!currentCategory){
    alert("Please select category first");
    return;
}

if(!description || !price){
    alert("Fill all product fields");
    return;
}
// ================= UPDATE MODE =================
if (editingProductId) {

    const { updateDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );

    const updateData = {
        description: description,
        price: parseFloat(price),
        category: currentCategory
    };

    // If new image selected
    if (file) {
        const imageRef = ref(storage, "products/" + Date.now() + "_" + file.name);
        const compressedImage = await compressImage(file, 300);
        await uploadBytes(imageRef, compressedImage);
        const imageURL = await getDownloadURL(imageRef);
        updateData.image = imageURL;
    }

    await updateDoc(doc(db, "products", editingProductId), updateData);

    alert("Product Updated Successfully ✅");

    editingProductId = null;
    addProductBtn.textContent = "Add Product";

    // Reset UI
    addProductSection.style.display = "none";
    document.getElementById("productImage").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    previewImage.src = "";
    previewImage.style.display = "none";
    removeBtn.style.display = "none";
    document.querySelector(".upload-placeholder").style.display = "block";

    return; // 🔥 STOP here (don’t continue to addDoc)
}
        try {

            // 🔹 Create image reference
            const imageRef = ref(storage, "products/" + Date.now() + "_" + file.name);

            // 🔹 Upload image to Firebase Storage
            const compressedImage = await compressImage(file, 300);
            await uploadBytes(imageRef, compressedImage);

            // 🔹 Get image URL
            const imageURL = await getDownloadURL(imageRef);

            // 🔹 Save product to Firestore
const category = currentCategory;

const productsRef = collection(db, "products");
const snapshot = await getDocs(productsRef);

await addDoc(productsRef, {
    image: imageURL,
    description: description,
    price: parseFloat(price),
    category: category,
    createdAt: Date.now(),
    position: snapshot.size + 1
});

            alert("Product Added Successfully");
            addProductSection.style.display = "none";

            // Optional: Clear form
            
            document.getElementById("productImage").value = "";
            document.getElementById("productDescription").value = "";
            document.getElementById("productPrice").value = "";
            previewImage.src = "";
            previewImage.style.display = "none";
            removeBtn.style.display = "none";
            document.querySelector(".upload-placeholder").style.display = "block";

        } catch (error) {
            alert(error.message);
        }
    });
}
/*-------------------------------square box image------------------------*/
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");
const removeBtn = document.getElementById("removeImageBtn");

if (uploadBox) {

    uploadBox.addEventListener("click", () => {
        fileInput.click();
    });
/*--------------------------------------------------------------------storage rules-------------------------------------*/
fileInput.addEventListener("change", () => {

    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
        removeBtn.style.display = "flex";
        document.querySelector(".upload-placeholder").style.display = "none";
    };

    reader.readAsDataURL(file);
});

    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent reopening file dialog

        fileInput.value = "";
        previewImage.src = "";
        previewImage.style.display = "none";
        removeBtn.style.display = "none"; // ✅ hide close button
        document.querySelector(".upload-placeholder").style.display = "block";
    });
}
/*-------------------------------cancel button--------------------*/


if (cancelProductBtn) {
    cancelProductBtn.addEventListener("click", function () {

        // Clear form fields
        
        document.getElementById("productImage").value = "";
        document.getElementById("productDescription").value = "";
        document.getElementById("productPrice").value = "";

        // Hide preview image
        const previewImage = document.getElementById("previewImage");
        previewImage.src = "";
        previewImage.style.display = "none";

        // Close modal (if using modal)
if (addProductSection) {
    addProductSection.style.display = "none";
}
    });
}

/* ================= CUSTOMER MODAL ================= */

const customerLink = document.getElementById("customerLink");
const customerModal = document.getElementById("customerModal");
const closeCustomer = document.getElementById("closeCustomer");
const getOtpBtn = document.getElementById("getOtpBtn");
const phoneSection = document.getElementById("phoneSection");
const otpSection = document.getElementById("otpSection");

/* Open Customer Modal */
if (customerLink) {
    customerLink.addEventListener("click", function (e) {
        e.preventDefault();
        customerModal.style.display = "flex";
    });
}

/* Close Customer Modal */
if (closeCustomer) {
    closeCustomer.addEventListener("click", function () {
        customerModal.style.display = "none";
        phoneSection.style.display = "block";
        otpSection.style.display = "none";
    });
}

/* Show OTP Section */
if (getOtpBtn) {
    getOtpBtn.addEventListener("click", function () {
        phoneSection.style.display = "none";
        otpSection.style.display = "block";
        document.querySelector(".otp-boxes input").focus();
    });
}

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
if (cartLink) {
    cartLink.addEventListener("click", function(e){
    e.preventDefault();
    cartModal.style.display = "flex";
});}

/* Close Cart */
if (closeCart) {
    closeCart.addEventListener("click", function(){
        cartModal.style.display = "none";
    });
}

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
window.goHome = function() {
currentCategory = "";
renderProducts();
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    // Show welcome message
    const message = document.getElementById("welcomeMessage");
    message.textContent = "Welcome to Thomas Traders Online Shopping Portal.";
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

    // ✅ Toggle dropup open/close
    const dropup = document.getElementById("homeDropup");
    dropup.classList.toggle("show");
}
document.addEventListener("click", function (e) {

    const dropup = document.getElementById("homeDropup");
    const homeBtn = document.querySelector(".home-btn");

    if (!dropup.contains(e.target) && !homeBtn.contains(e.target)) {
        dropup.classList.remove("show");
    }
});
/*-------------------------------------------------------Product Card UI Generator---------------------------------------------------------------------*/
function renderProductCard(id, product) {

    const card = document.createElement("div");
    card.className = "product-card";
if (isAdmin) {
    card.setAttribute("draggable", true);
    card.dataset.id = id;
}

        /* ===== ADMIN VIEW ===== */
        card.innerHTML = `
            <img src="${product.image}" class="clickable-image"
     onclick="openImageModal('${product.image}')">      
            <div class="product-info">
                <strong>${product.description}</strong>
                <p>₹${product.price}</p>
            </div>

            <div class="product-actions">
                <button class="edit-btn"
                    onclick="editProduct('${id}')">Edit</button>

                <button class="delete-btn"
                    onclick="deleteProduct('${id}')">Delete</button>
            </div>
        `;

    } else {

        /* ===== CUSTOMER VIEW ===== */
        card.innerHTML = `
            <img src="${product.image}" class="clickable-image"
     onclick="openImageModal('${product.image}')">    
            <div class="product-info">
                <strong>${product.description}</strong>
                <p>₹${product.price}</p>
            </div>

            <div class="product-actions">
                <button onclick="decreaseQty(this)">-</button>
                <span class="qty">1</span>
                <button onclick="increaseQty(this)">+</button>

                <button class="buy-btn"
                    onclick="addToCart('${product.description}', ${product.price})">
                    Buy Now
                </button>
            </div>
        `;
    }

    productsContainer.appendChild(card);
}
/*--------------------------------Delete Product(Admin)--------------------*/
window.deleteProduct = async function(id){

    if(!confirm("Delete this product?")) return;

    await deleteDoc(doc(db, "products", id));
}
/*--------------------------------------Edit Product---------------------*/
/*--------------------------------------Edit Product (Use Add UI)---------------------*/
window.editProduct = function(id){

    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;

    // Show Add Product UI
    addProductSection.style.display = "block";

    // Fill existing data
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productPrice").value = product.price;

    // Show existing image preview
    previewImage.src = product.image;
    previewImage.style.display = "block";
    removeBtn.style.display = "flex";
    document.querySelector(".upload-placeholder").style.display = "none";

    // Change button text
    addProductBtn.textContent = "Update Product";
};
/*--------------------------Quantity Buttons--------------------------*/
window.increaseQty = function(btn){
    const qty = btn.parentElement.querySelector(".qty");
    qty.textContent = Number(qty.textContent) + 1;
}

window.decreaseQty = function(btn){
    const qty = btn.parentElement.querySelector(".qty");
    let value = Number(qty.textContent);
    if(value > 1) qty.textContent = value - 1;
}
/*---------------------------------Toggle---------------------------*/
window.toggleMenu = function() {
    const menu = document.getElementById("menuDropdown");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}
// ================= MY PROFILE LOGIC =================

const myProfileLink = document.getElementById("myProfileLink");

if (myProfileLink) {
    myProfileLink.addEventListener("click", function () {

        const isAdmin = localStorage.getItem("isAdmin") === "true";
        const message = document.getElementById("welcomeMessage");

        if (isAdmin) {
            message.textContent = "Hi Admin 👋";
        } else {
            message.textContent = "Please login";
        }

        message.classList.add("show");

        setTimeout(() => {
            message.classList.remove("show");
        }, 2000);

    });
}

/* ================= LOAD PRODUCTS ================= */

const productsContainer = document.getElementById("productsContainer");
let allProducts = [];
const q = query(collection(db, "products"), orderBy("position"));
onSnapshot(q, (snapshot) => {
    allProducts = [];
    snapshot.forEach(docSnap => {
        allProducts.push({
            id: docSnap.id,
            ...docSnap.data()
        });
    });
    renderProducts(); // 👈 redraw UI
});
function renderProducts() {
    productsContainer.innerHTML = "";
    allProducts.forEach(product => {
        if (currentCategory &&
            product.category !== currentCategory) return;
        renderProductCard(product.id, product);
    });
}
/* ================= IMAGE POPUP LOGIC ================= */

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageBtn = document.querySelector(".close-image");

window.openImageModal = function(imageSrc){
    modalImage.src = imageSrc;
    imageModal.style.display = "flex";
};

if(closeImageBtn){
    closeImageBtn.addEventListener("click", function(){
        imageModal.style.display = "none";
    });
}

window.addEventListener("click", function(e){
    if(e.target === imageModal){
        imageModal.style.display = "none";
    }
});
/* ================= DRAG & DROP ADMIN SORT ================= */

let draggedItem = null;

document.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("product-card") && isAdmin) {
        draggedItem = e.target;
        e.target.style.opacity = "0.5";
    }
});

document.addEventListener("dragend", async (e) => {
    if (draggedItem && isAdmin) {
        draggedItem.style.opacity = "1";
        await updatePositions();
        draggedItem = null;
    }
});

document.addEventListener("dragover", (e) => {
    if (!isAdmin) return;

    e.preventDefault();
    const container = productsContainer;
    const afterElement = getDragAfterElement(container, e.clientY);

    if (afterElement == null) {
        container.appendChild(draggedItem);
    } else {
        container.insertBefore(draggedItem, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll(".product-card:not([style*='opacity'])")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function updatePositions() {
    const cards = document.querySelectorAll(".product-card");

    for (let i = 0; i < cards.length; i++) {
        const id = cards[i].dataset.id;

        await updateDoc(doc(db, "products", id), {
            position: i + 1
        });
    }
}
// Make functions global for HTML onclick
window.selectCategory = selectCategory;
window.removeItem = removeItem;
window.addToCart = addToCart;
window.deleteProduct = deleteProduct;




































































