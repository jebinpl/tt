let cart = JSON.parse(localStorage.getItem("cart")) || [];
let editingProductId = null;
import { getDoc, setDoc } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// ================= FIREBASE IMPORTS =================
console.log("Script Loaded Successfully");
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
//============== otp ==============
import { 
    getAuth, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const auth = getAuth();
window.recaptchaVerifier = new RecaptchaVerifier(auth, 'getOtpBtn', {
    'size': 'invisible',
    'callback': (response) => {
        console.log("reCAPTCHA solved");
    }
});
let isAdmin = localStorage.getItem("isAdmin") === "true";
let currentCategory = "";
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.querySelector(".login-btn");
const dropdown = document.querySelector(".dropdown");
function closeDropdown() {
    if (dropdown) {
        dropdown.style.display = "none";
    }
}
let customerPhone = localStorage.getItem("customerPhone");

if (isAdmin) {
    loginBtn.textContent = "Admin";
}
else if (customerPhone) {
    loginBtn.textContent = "Logout";
}
else {
    loginBtn.textContent = "Login";
}
if (adminPanel) {
    adminPanel.style.display = isAdmin ? "block" : "none";
}
/*------------------------------------------Login Button------------------------------------------------------*/

if (loginBtn) {
    if (isAdmin) {
        loginBtn.textContent = "Admin";
    } else if (customerPhone) {
        loginBtn.textContent = "Logout";
    } else {
        loginBtn.textContent = "Login";
    }
}
if (loginBtn) {
loginBtn.addEventListener("click", function () {

    let customerPhone = localStorage.getItem("customerPhone");
    let isAdminNow = localStorage.getItem("isAdmin") === "true";

    // 🔐 Admin stays same
    if (isAdminNow) {
        dropdown.style.display =
            dropdown.style.display === "block" ? "none" : "block";
        return;
    }

    // 👤 Customer logged in → Logout
    if (customerPhone) {
        customerLogout();
        return;
    }

    // ❌ Not logged in → Show dropdown
    dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
});
}
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
        closeDropdown();
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
    position: Date.now()
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
        closeDropdown();
        customerModal.style.display = "flex";
    });
    document.addEventListener("click", function (e) {

    if (
        dropdown &&
        !dropdown.contains(e.target) &&
        !loginBtn.contains(e.target)
    ) {
        dropdown.style.display = "none";
    }

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
if(getOtpBtn){
getOtpBtn.addEventListener("click", async function () {
    const phoneNumber = "+91" + document.getElementById("phoneNumber").value;
    const appVerifier = window.recaptchaVerifier;
    try {
        const confirmationResult = await signInWithPhoneNumber(
            auth,
            phoneNumber,
            appVerifier
        );
        window.confirmationResult = confirmationResult;
        phoneSection.style.display = "none";
        otpSection.style.display = "block";
        alert("OTP Sent Successfully");
    } catch (error) {
        alert(error.message);
    }
});
}
const verifyBtn = otpSection.querySelector("button");

verifyBtn.addEventListener("click", async function () {

    const otpInputs = document.querySelectorAll(".otp-boxes input");
    let otp = "";

    otpInputs.forEach(input => {
        otp += input.value;
    });

    try {

        const result = await window.confirmationResult.confirm(otp);
        const user = result.user;
        const phoneNumber = user.phoneNumber;

localStorage.setItem("customerPhone", phoneNumber);

// 🔥 REALTIME CART SYNC
onSnapshot(doc(db,"carts",phoneNumber),(snap)=>{
    if(snap.exists()){
        cart = snap.data().items || [];
        updateCart();
    }
});
        const userRef = doc(db, "customers", phoneNumber);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            // ✅ Existing User
            const data = userSnap.data();

            document.getElementById("welcomeMessage").textContent =
                `Hi ${data.name} 👋`;

            customerModal.style.display = "none";

        } else {

            // 🆕 First time user → open profile modal
            profileModal.style.display = "flex";

            // Clear fields
            document.getElementById("editName").value = "";
            document.getElementById("editAddress").value = "";

            // Mark as first time user
            localStorage.setItem("firstTimeUser", "true");

            customerModal.style.display = "none";
        }

    } catch (error) {
        alert("Invalid OTP ❌");
    }

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
function addToCart(btn, name, price){

    const qtyElement = btn.parentElement.querySelector(".qty");
    const quantity = parseInt(qtyElement.textContent);

    const existingItem = cart.find(item => item.name === name);

    if(existingItem){
        existingItem.qty += quantity;
    }else{
        cart.push({ name, price, qty: quantity });
    }

    updateCart();
}

/* Update Cart UI */
async function updateCart(){
    cartItemsContainer.innerHTML = "";
if(cart.length === 0){
    cartItemsContainer.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
    cartCount.textContent = 0;
    cartTotal.textContent = 0;

    const stickyBar = document.getElementById("stickyCartBar");
    if(stickyBar) stickyBar.style.display = "none";

    return;
}
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price * item.qty;
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        itemDiv.innerHTML = `
        <div class="cart-left">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price}</div>
        </div>
        <div class="cart-right">
            <button class="qty-btn" onclick="decreaseCartQty(${index})">-</button>
            <span class="cart-qty">${item.qty}</span>
            <button class="qty-btn" onclick="increaseCartQty(${index})">+</button>
            <button class="remove-btn" onclick="removeItem(${index})">X</button>
        </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });
    cartCount.textContent = cart.reduce((sum,item)=>sum+item.qty,0);
    cartTotal.textContent = total;
    /* ================= STICKY CART ================= */

const stickyBar = document.getElementById("stickyCartBar");
const stickyItems = document.getElementById("stickyCartItems");
const stickyTotal = document.getElementById("stickyCartTotal");

const totalItems = cart.reduce((sum,item)=>sum+item.qty,0);

if(totalItems > 0){
    stickyBar.style.display = "flex";
    stickyItems.textContent = totalItems + " Items";
    stickyTotal.textContent = total;
}else{
    stickyBar.style.display = "none";
}
    // SAVE CART
const phone = localStorage.getItem("customerPhone");
const isAdmin = localStorage.getItem("isAdmin") === "true";
if(phone && !isAdmin){
await setDoc(doc(db,"carts",phone),{
items: cart
},{merge:true});
}}
/* Remove Item */
async function removeItem(index){

    cart.splice(index,1);

    const phone = localStorage.getItem("customerPhone");

    if(phone){
        await setDoc(doc(db,"carts",phone),{
            items: cart
        },{merge:true});
    }

    updateCart();
}
window.increaseCartQty = async function(index){
    cart[index].qty++;

    const phone = localStorage.getItem("customerPhone");

    if(phone){
        await setDoc(doc(db,"carts",phone),{
            items: cart
        },{merge:true});
    }

    updateCart();
}

window.decreaseCartQty = async function(index){

    if(cart[index].qty > 1){
        cart[index].qty--;
    }else{
        cart.splice(index,1);
    }

    const phone = localStorage.getItem("customerPhone");

    if(phone){
        await setDoc(doc(db,"carts",phone),{
            items: cart
        },{merge:true});
    }

    updateCart();
}
/* ================= CHECKOUT SYSTEM ================= */

const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");

if(checkoutBtn){
checkoutBtn.addEventListener("click", async function(){

const phone = localStorage.getItem("customerPhone");

if(!phone){
alert("Please login first");
return;
}

if(cart.length===0){
alert("Cart is empty");
return;
}

const userSnap = await getDoc(doc(db,"customers",phone));

if(!userSnap.exists()){
alert("Please update profile first");
return;
}

const data = userSnap.data();

document.getElementById("checkoutAddress").textContent = data.address;
document.getElementById("checkoutTotal").textContent = cartTotal.textContent;

cartModal.style.display="none";
checkoutModal.style.display="flex";

});
}

if(closeCheckout){
closeCheckout.onclick=function(){
checkoutModal.style.display="none";
};
}
/* ================= PLACE ORDER ================= */

const submitOrderBtn = document.getElementById("submitOrderBtn");

if(submitOrderBtn){
submitOrderBtn.addEventListener("click", async function(){

const phone = localStorage.getItem("customerPhone");

const orderId = "ORD"+Date.now();

const address = document.getElementById("checkoutAddress").textContent;

await addDoc(collection(db,"orders"),{

orderId: orderId,
phone: phone,
items: cart,
total: parseFloat(cartTotal.textContent),
address: address,
status: "Order Placed",
createdAt: Date.now()

});

alert("Order placed successfully");
cart = [];
localStorage.setItem("cart", JSON.stringify(cart));
updateCart();
const stickyBar = document.getElementById("stickyCartBar");
if (stickyBar) {
    stickyBar.style.display = "none";
}
checkoutModal.style.display="none";

});
}
/* ================= MY ORDERS ================= */

const myOrdersLink = document.getElementById("myOrdersLink");
const ordersModal = document.getElementById("ordersModal");
const ordersList = document.getElementById("ordersList");
const closeOrders = document.getElementById("closeOrders");

if(myOrdersLink){

myOrdersLink.addEventListener("click", async function() {

    const phone = localStorage.getItem("customerPhone");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    const adminSection = document.getElementById("adminOrdersSection");
    const customerSection = document.getElementById("customerOrdersSection");

    if(isAdmin){
        adminSection.style.display="block";
        customerSection.style.display="none";
    } else {
        adminSection.style.display="none";
        customerSection.style.display="block";
    }

    if(!phone && !isAdmin){
        alert("Please login");
        return;
    }

    ordersList.innerHTML="Loading...";

    let q;
    if(isAdmin){
        q = query(collection(db,"orders"), orderBy("createdAt","desc"));
    } else {
        q = query(
            collection(db,"orders"),
            where("phone","==",phone),
            orderBy("createdAt","desc")
        );
    }

    const snapshot = await getDocs(q);

    ordersList.innerHTML="";

    snapshot.forEach(docSnap => {
        const order = docSnap.data();
        const id = docSnap.id;

        if(!isAdmin && order.phone!==phone) return;

        let items="", prices="", qty="";
        order.items.forEach(i=>{
            items += i.name + "<br>";
            prices += "₹"+i.price+"<br>";
            qty += i.qty+"<br>";
        });

        const date = new Date(order.createdAt).toLocaleString();

        if(isAdmin){
            // Excel style table row
            ordersList.innerHTML += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.phone}</td>
                    <td>${items}</td>
                    <td>${prices}</td>
                    <td>${qty}</td>
                    <td>₹${order.total}</td>
                    <td>${order.address}</td>
                    <td>${date}</td>
                    <td>
                        <select onchange="updateOrderStatus('${id}', this.value)">
                            <option ${order.status==="Order Placed"?"selected":""}>Order Placed</option>
                            <option ${order.status==="Items Bagged"?"selected":""}>Items Bagged</option>
                            <option ${order.status==="Shipped"?"selected":""}>Shipped</option>
                            <option ${order.status==="Delivered"?"selected":""}>Delivered</option>
                            <option ${order.status==="Closed"?"selected":""}>Closed</option>
                        </select>
                    </td>
                    <td>
                        <button onclick="deleteOrder('${id}', '${order.status}')">Delete</button>
                    </td>
                </tr>
            `;
        } else {
            // Customer card (no change)
            const cardContainer = document.getElementById("customerOrders");
            let step = 1;
            if(order.status === "Items Bagged") step = 2;
            if(order.status === "Shipped") step = 3;
            if(order.status === "Delivered") step = 4;
            if(order.status === "Closed") step = 4;

            cardContainer.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #${order.orderId}</span>
                        <span>${date}</span>
                    </div>
                    <div class="order-items"><b>Items:</b><br>${items}</div>
                    <div class="order-items"><b>Address:</b> ${order.address}</div>
                    <div class="order-footer">
                        <div class="order-total">₹${order.total}</div>
                        <div class="order-status status-${order.status.toLowerCase()}">${order.status}</div>
                    </div>
                    <button class="cancel-btn"
                        onclick="cancelOrder('${id}','${order.status}')"
                        ${order.status !== "Order Placed" ? "disabled" : ""}>
                        Cancel Order
                    </button>
                </div>
            `;
        }
    });

    ordersModal.style.display="flex";
});}

if(closeOrders){
closeOrders.onclick=function(){
ordersModal.style.display="none";
};
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
                    onclick="addToCart(this, '${product.description}', ${product.price})">
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
window.toggleMenu = function(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById("menuDropdown");
    if (!menu) return;
    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}
/* ================= LOAD PRODUCTS ================= */

const productsContainer = document.getElementById("productsContainer");
let allProducts = [];

onSnapshot(collection(db, "products"), (snapshot) => {

    allProducts = [];

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

        allProducts.push({
            id: docSnap.id,
            position: data.position || 0, // fallback if missing
            ...data
        });
    });

    // sort manually instead of Firestore
    allProducts.sort((a, b) => a.position - b.position);

    renderProducts();
});
function renderProducts() {
    productsContainer.innerHTML = "";
    allProducts.forEach(product => {
        if (currentCategory !== "" &&
            product.category !== currentCategory) {
            return;
        }
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
document.addEventListener("click", function (e) {

    const menu = document.getElementById("menuDropdown");
    const menuBtn = document.querySelector(".menu-btn");

    if (!menu || !menuBtn) return;

    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.style.display = "none";
    }
});
// Make functions global for HTML onclick
window.selectCategory = selectCategory;
window.removeItem = removeItem;
window.addToCart = addToCart;
window.deleteProduct = deleteProduct;

// ✅ Customer Logout
const logoutModal = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogout");
const cancelLogoutBtn = document.getElementById("cancelLogout");

// Open modal instead of direct logout
window.customerLogout = function () {
    logoutModal.style.display = "flex";
};

// Cancel button
if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener("click", function () {
        logoutModal.style.display = "none";
    });
}

// Confirm logout
if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener("click", async function () {

        const phone = localStorage.getItem("customerPhone");

        localStorage.removeItem("customerPhone");

        // ❌ Do NOT delete Firebase cart
        // await deleteDoc(doc(db,"carts",phone));

        cart = [];
        updateCart();

        signOut(auth).then(() => {
            logoutModal.style.display = "none";
            location.reload();
        });

    });
}

// Close when clicking outside box
window.addEventListener("click", function(e){
    if (e.target === logoutModal) {
        logoutModal.style.display = "none";
    }
});
/* ================= PROFILE SYSTEM ================= */

const myProfileLink = document.getElementById("myProfileLink");

const profileModal = document.getElementById("profileModal");
const profileView = document.getElementById("profileView");
const profileEdit = document.getElementById("profileEdit");

const profileGreeting = document.getElementById("profileGreeting");
const profileAddress = document.getElementById("profileAddress");

const editProfileBtn = document.getElementById("editProfileBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const closeProfile = document.getElementById("closeProfile");

/* OPEN PROFILE */
if (myProfileLink) {
    myProfileLink.addEventListener("click", async function () {

        const phone = localStorage.getItem("customerPhone");

        if (!phone) {
            alert("Please login first");
            return;
        }

        try {
            const userRef = doc(db, "customers", phone);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {

                const data = userSnap.data();

                profileGreeting.textContent = `Hi ${data.name} 👋`;
                profileAddress.textContent = data.address;

                profileView.style.display = "block";
                profileEdit.style.display = "none";

                profileModal.style.display = "flex";
            }
        } catch (error) {
            alert("Network error. Please check internet.");
        }
    });
}

/* SWITCH TO EDIT MODE */
if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function () {

        profileView.style.display = "none";
        profileEdit.style.display = "block";

        document.getElementById("editName").value =
            profileGreeting.textContent.replace("Hi ", "").replace(" 👋", "");

        document.getElementById("editAddress").value =
            profileAddress.textContent;
    });
}

/* SAVE PROFILE */
if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", async function () {

        const phone = localStorage.getItem("customerPhone");
        const name = document.getElementById("editName").value.trim();
        const address = document.getElementById("editAddress").value.trim();

        if (!name || !address) {
            alert("Please fill all fields");
            return;
        }

        try {
            await setDoc(doc(db, "customers", phone), {
                name: name,
                address: address
            });

            profileModal.style.display = "none";

            document.getElementById("welcomeMessage").textContent =
                `Hi ${name} 👋`;

        } catch (error) {
            alert("Failed to save profile.");
        }
    });
}

/* CANCEL EDIT */
if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener("click", function () {

        profileEdit.style.display = "none";
        profileView.style.display = "block";
    });
}

/* CLOSE MODAL */
if (closeProfile) {
    closeProfile.addEventListener("click", function () {
        profileModal.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", function(){

    const phone = localStorage.getItem("customerPhone");

    if(phone){

        onSnapshot(doc(db,"carts",phone),(snap)=>{
            if(snap.exists()){
                cart = snap.data().items || [];
                updateCart();
            }
        });

    }else{
        updateCart();
    }

});
/* ================= CANCEL ORDER ================= */

window.cancelOrder = async function(id,status){

if(status!=="Order Placed"){
alert("Order cannot be cancelled");
return;
}

if(!confirm("Cancel this order?")) return;

await updateDoc(doc(db,"orders",id),{
status:"Cancelled"
});

alert("Order cancelled");
document.getElementById("myOrdersLink").click();

};
const stickyCheckoutBtn = document.getElementById("stickyCheckoutBtn");

if(stickyCheckoutBtn){
stickyCheckoutBtn.addEventListener("click",function(){
    cartModal.style.display="flex";
});
}
/* ================= UPDATE ORDER STATUS ================= */

window.updateOrderStatus = async function(id,status){

await updateDoc(doc(db,"orders",id),{
status:status
});

alert("Order status updated");

};


/* ================= DELETE ORDER ================= */

window.deleteOrder = async function(id,status){

if(status!=="Closed"){
alert("Order must be CLOSED before deleting");
return;
}

if(!confirm("Delete this order?")) return;

await deleteDoc(doc(db,"orders",id));

alert("Order deleted");

location.reload();

};














































































































