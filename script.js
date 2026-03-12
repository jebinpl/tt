let cart = JSON.parse(localStorage.getItem("cart")) || [];
let editingProductId = null;
let cartListener = null;
let ordersListener = null;
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
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// ================= GLOBAL MODAL SYSTEM =================

window.openModal = function(modal) {
    if (!modal) return;

    openModal(modal)
    document.body.classList.add("modal-open");
};

window.closeModal = function(modal) {
    if (!modal) return;

    closeModal(modal)
    document.body.classList.remove("modal-open");
};
// ================= GLOBAL MODAL SYSTEM END=================
import { 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
//============== otp ==============
import { 
    getAuth, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const auth = getAuth();
auth.useDeviceLanguage();
// ================= RESET RECAPTCHA =================
function resetRecaptcha() {

    // destroy old captcha
    if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
    }

    // create new captcha
    window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",   // attach to OTP button
        {
            size: "invisible",
            callback: () => {
                console.log("reCAPTCHA solved");
            }
        }
    );
}
// ================= RESET RECAPTCHA END =================
let isAdmin = localStorage.getItem("isAdmin") === "true";
if (isAdmin) {
    document.body.classList.add("admin-mode");
}
/* ================= ADMIN ORDER NOTIFICATION ================= */

const badge = document.getElementById("adminOrderBadge");

if (isAdmin && badge) {
// ✅ stop previous listener (prevents duplicates)
    if (ordersListener) ordersListener();
    ordersListener = onSnapshot(collection(db, "orders"), (snapshot) => {

        let newOrdersCount = 0;

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            // ✅ count only ACTIVE orders
            if (
                order.status !== "Delivered" &&
                order.status !== "Closed" &&
                order.status !== "Cancelled"
            ) {
                newOrdersCount++;
            }

        });

        // ✅ Update badge
        if (newOrdersCount > 0) {
            badge.style.display = "flex";
            badge.textContent = newOrdersCount;
        } else {
            badge.style.display = "none";
        }

    });
}
let currentCategory = "";
const adminPanel = document.getElementById("adminPanel");
const loginBtn = document.querySelector(".login-btn");
const dropdown = document.querySelector(".dropdown");
// ================= LOGIN UI STATE =================
function updateLoginUI() {

    const customerPhone = localStorage.getItem("customerPhone");
    const isAdminNow = localStorage.getItem("isAdmin") === "true";

    if (!loginBtn) return;

    if (isAdminNow) {
        loginBtn.textContent = "Admin";
    }
    else if (customerPhone) {
        loginBtn.textContent = "Logout";
    }
    else {
        loginBtn.textContent = "Login";
    }
}
updateLoginUI();
// ================= LOGIN UI STATE END =================
function closeDropdown() {
    if (dropdown) {
        dropdown.style.display = "none";
    }
}
if (adminPanel) {
    adminPanel.style.display = isAdmin ? "block" : "none";
}

/*------------------------------------------Login Button------------------------------------------------------*/

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
            openModal(adminModal);
        }
    });
}
if (closeAdmin) {
    closeAdmin.addEventListener("click", function() {
        closeModal(adminModal);
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
if(categoryName === "ALL"){
    categoryName = "All Products";
}
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

        if (category === "ALL") {
            currentCategory = "";
            renderProducts();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            selectCategory(category);
        }

        // hide menu
        const menu = document.getElementById("menuDropdown");
        if (menu) menu.style.display = "none";
    });
});
/* ================= IMAGE AUTO COMPRESS ================= */

async function compressImage(file, maxSizeKB = 30) {
    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = function (event) {

            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

// ===== AUTO RESIZE IMAGE =====
const maxWidth = 900; // resize large camera images

let width = img.width;
let height = img.height;

if (width > maxWidth) {
    height = height * (maxWidth / width);
    width = maxWidth;
}

canvas.width = width;
canvas.height = height;

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

                    }, "image/webp", quality);
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
        if (!editingProductId && !file) {
    alert("Please select product image");
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

    // 🔹 get existing product
    const snap = await getDoc(doc(db,"products",editingProductId));

    if(snap.exists()){
        const data = snap.data();

        // 🔹 delete old image if exists
        if(data.imagePath){
            const oldImageRef = ref(storage, data.imagePath);
            await deleteObject(oldImageRef);
        }
    }

    // 🔹 upload new image
    const imageRef = ref(storage, "products/" + Date.now() + "_" + file.name);
    const compressedImage = await compressImage(file, 30);
    await uploadBytes(imageRef, compressedImage);

    const imageURL = await getDownloadURL(imageRef);

    updateData.image = imageURL;
    updateData.imagePath = imageRef.fullPath;
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
            const compressedImage = await compressImage(file, 30);
            await uploadBytes(imageRef, compressedImage);

            // 🔹 Get image URL
            const imageURL = await getDownloadURL(imageRef);

            // 🔹 Save product to Firestore
const category = currentCategory;

const productsRef = collection(db, "products");
const snapshot = await getDocs(productsRef);

await addDoc(productsRef, {
    image: imageURL,
    imagePath: imageRef.fullPath,
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
        openModal(customerModal);
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
        closeModal(customerModal);
        phoneSection.style.display = "block";
        otpSection.style.display = "none";
    });
}

/* Show OTP Section */
if(getOtpBtn){
getOtpBtn.addEventListener("click", async function () {
    const phoneNumber = "+91" + document.getElementById("phoneNumber").value;
    // ⭐ CREATE NEW CAPTCHA EACH TIME
    resetRecaptcha();
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
updateLoginUI();
// 🔥 REALTIME CART SYNC
// remove old listener first
if (cartListener) cartListener();

cartListener = onSnapshot(doc(db,"carts",phoneNumber),(snap)=>{
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
            openModal(profileModal);

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
    openModal(cartModal);
});}

/* Close Cart */
if (closeCart) {
    closeCart.addEventListener("click", function(){
        closeModal(cartModal);
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
const changeAddressBtn = document.getElementById("changeAddressBtn");

if (changeAddressBtn) {
    changeAddressBtn.addEventListener("click", async function () {

        const phone = localStorage.getItem("customerPhone");

        if (!phone) {
            alert("Please login first");
            return;
        }

        // ✅ remember checkout return
        localStorage.setItem("returnToCheckout", "true");

        // 🔹 Close checkout modal
        closeModal(checkoutModal);

        try {
            const userRef = doc(db, "customers", phone);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {

                const data = userSnap.data();

                // ✅ get profile elements safely
                const profileModal = document.getElementById("profileModal");
                const profileView = document.getElementById("profileView");
                const profileEdit = document.getElementById("profileEdit");

                // Fill edit fields
                document.getElementById("editName").value = data.name || "";
                document.getElementById("editAddress").value = data.address || "";

                // Open EDIT mode directly
                profileView.style.display = "none";
                profileEdit.style.display = "block";
                openModal(profileModal);
            }

        } catch (error) {
            alert("Unable to load profile");
        }
    });
}
if (checkoutBtn) {
checkoutBtn.addEventListener("click", async function(){

const phone = localStorage.getItem("customerPhone");

if(!phone){
alert("Please login first");
return;
}

if(cart.length === 0){
alert("Cart is empty");
return;
}

try{

const userSnap = await getDoc(doc(db,"customers",phone));

if(!userSnap.exists()){
alert("Please update profile first");
return;
}

const data = userSnap.data();

document.getElementById("checkoutAddress").textContent = data.address;
document.getElementById("checkoutTotal").textContent = cartTotal.textContent;

// ✅ correct modal switching
closeModal(cartModal);
openModal(checkoutModal);

}catch(error){
alert("Checkout failed. Please try again.");
}

});
}
if(closeCheckout){
closeCheckout.onclick=function(){
closeModal(checkoutModal);
};
}
/* ================= PLACE ORDER ================= */
let isPlacingOrder = false;
const submitOrderBtn = document.getElementById("submitOrderBtn");

if(submitOrderBtn){

submitOrderBtn.addEventListener("click", async function(){

if(isPlacingOrder) return;
if(cart.length === 0){
alert("Cart is empty");
return;
}
isPlacingOrder = true;

submitOrderBtn.disabled = true;
submitOrderBtn.textContent = "Processing...";

try{

const phone = localStorage.getItem("customerPhone");

const orderId = "ORD" + Date.now();

const address = document.getElementById("checkoutAddress").textContent;
const orderItems = JSON.parse(JSON.stringify(cart));
await addDoc(collection(db,"orders"),{
orderId: orderId,
phone: phone,
items: orderItems,
total: parseFloat(cartTotal.textContent),
address: address,
status: "Order Placed",
createdAt: Date.now()
});

alert("Order placed successfully");

/* clear firebase cart */
await setDoc(doc(db,"carts",phone),{
items:[]
},{merge:true});

/* clear local cart */
cart = [];
localStorage.setItem("cart", JSON.stringify(cart));

updateCart();

closeModal(checkoutModal);

/* reset button */
isPlacingOrder = false;
submitOrderBtn.disabled = false;
submitOrderBtn.textContent = "Submit Order";

}
catch(error){

console.error(error);

alert("Order failed. Try again");

isPlacingOrder = false;
submitOrderBtn.disabled = false;
submitOrderBtn.textContent = "Submit Order";

}

});
}
/* ================= MY ORDERS ================= */

const myOrdersLink = document.getElementById("myOrdersLink");
const ordersModal = document.getElementById("ordersModal");
const ordersList = document.getElementById("adminOrdersList");
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
    document.getElementById("customerOrders").innerHTML = "";
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
                    <td>
${date}<br>
<small>
${order.lastUpdatedBy ? 
`Updated by ${order.lastUpdatedBy}<br>
${new Date(order.lastUpdatedAt).toLocaleString()}`
: ""}
</small>
</td>
                    <td>
                    <select
                    class="status-${order.status.toLowerCase().replaceAll(" ","-")}"
                    ${order.cancelledBy==="Customer" ? "disabled" : ""}
                    onchange="updateOrderStatus('${id}', this.value)">
                            <option ${order.status==="Order Placed"?"selected":""}>Order Placed</option>
                            <option ${order.status==="Items Bagged"?"selected":""}>Items Bagged</option>
                            <option ${order.status==="Shipped"?"selected":""}>Shipped</option>
                            <option ${order.status==="Delivered"?"selected":""}>Delivered</option>
                            <option ${order.status==="Closed"?"selected":""}>Closed</option>
                            <option ${order.status==="Cancelled"?"selected":""}>Cancelled</option>
                        </select>
                    </td>
                            <td>
                                    ${
                                        (order.status === "Closed" || order.status === "Cancelled")
                                         ? `<button class="delete-order-btn"
                                         onclick="deleteOrder('${id}')">
                                         Delete
                                         </button>`
                                            : ""
                                     }
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
                    <hr>
                    <div class="order-items"><b>Items:</b><br>${items}</div>
                    <hr>
                    <div class="order-items"><b>Address:</b> ${order.address}</div>
                    <hr>
                    <div class="order-footer">
                        <div class="order-total">₹${order.total}</div>
                        <div class="order-status status-${order.status.toLowerCase().replaceAll(" ","-")}">${order.status}</div>
                    </div>
${order.status === "Order Placed" ? `
<button class="cancel-btn"
    onclick="cancelOrder('${id}','${order.status}')">
    Cancel Order
</button>
` : ""}
                </div>
            `;
        }
    });

    openModal(ordersModal);
});}

if(closeOrders){
closeOrders.onclick=function(){
closeModal(ordersModal);
};
}
/* ================= HOME BUTTON WELCOME VOICE ================= */
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

    setTimeout(() => message.classList.remove("show"), 2000);

    // 🎙 Voice Welcome with 5-minute cooldown
    if ('speechSynthesis' in window) {
        const lastPlayed = localStorage.getItem("homeVoiceLastPlayed");
        const now = Date.now();

        // 5 minutes = 5 * 60 * 1000 ms
        if (!lastPlayed || now - lastPlayed > 5 * 60 * 1000) {
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

            // ✅ update timestamp
            localStorage.setItem("homeVoiceLastPlayed", now);
        }
    }

    // Toggle dropup open/close
    const dropup = document.getElementById("homeDropup");
    dropup.classList.toggle("show");
};
/* ================= HOME BUTTON WELCOME VOICE END ================= */

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

    card.innerHTML = `
<div class="product-row">

    <!-- LEFT IMAGE -->
    <div class="product-image-box">
        <img src="${product.image}" class="clickable-image"
            onclick="openImageModal('${product.image}', '${id}')">
    </div>

    <!-- RIGHT CONTENT -->
    <div class="product-details">

        <div class="product-description">
            ${product.description}
        </div>

        <div class="product-bottom">

            <div class="product-price">
                ₹${product.price}
            </div>

            <div class="product-actions">

                ${
                    isAdmin
                    ? `
                        <button class="edit-btn"
                            onclick="editProduct('${id}')">
                            Edit
                        </button>

                        <button class="delete-btn"
                            onclick="deleteProduct('${id}')">
                            Delete
                        </button>
                      `
                    : `
                        <div class="qty-control">
                            <button onclick="decreaseQty(this)">−</button>
                            <span class="qty">1</span>
                            <button onclick="increaseQty(this)">+</button>
                        </div>

                        <button class="buy-btn"
                            onclick="addToCart(this, '${product.description}', ${product.price})">
                            Buy
                        </button>
                      `
                }

            </div>

        </div>

    </div>

</div>
`;

    productsContainer.appendChild(card);
}
/*--------------------------------Delete Product(Admin)--------------------*/
window.deleteProduct = async function(id){

    if(!confirm("Delete this product?")) return;

    try{

        const snap = await getDoc(doc(db,"products",id));

        if(snap.exists()){

            const data = snap.data();

            // 🔹 NEW products (with imagePath)
            if(data.imagePath){
                const imageRef = ref(storage, data.imagePath);
                await deleteObject(imageRef);
            }

            // 🔹 OLD products (only image URL stored)
            else if(data.image){
                const url = data.image;

                const path = decodeURIComponent(
                    url.split("/o/")[1].split("?")[0]
                );

                const imageRef = ref(storage, path);

                await deleteObject(imageRef);
            }
        }

        await deleteDoc(doc(db,"products",id));

        alert("Product deleted successfully");

    }catch(error){
        console.error(error);
        alert("Delete failed");
    }
}
/*--------------------------------------Edit Product (Use Add UI)---------------------*/
/* ================= INLINE EDIT PRODUCT (ADMIN) ================= */

window.editProduct = function(id){

    const card = document.querySelector(`[data-id="${id}"]`);
    const product = allProducts.find(p => p.id === id);

    if(!card || !product) return;

    const descDiv = card.querySelector(".product-description");
    const imageBox = card.querySelector(".product-image-box");
    imageBox.innerHTML = `
    <input type="file"
        class="image-input"
        accept="image/*"
        onchange="previewInlineImage(event,this)">

    <img src="${product.image}"
         class="clickable-image preview-inline">
`;
    const priceDiv = card.querySelector(".product-price");
    const actions = card.querySelector(".product-actions");

    // Convert text → inputs
    descDiv.innerHTML =
        `<input class="inline-input desc-input"
            value="${product.description}">`;

    priceDiv.innerHTML =
        `₹ <input type="number"
            class="inline-input price-input"
            value="${product.price}">`;

    // Replace buttons
    actions.innerHTML = `
        <button class="save-btn"
            onclick="saveInlineEdit('${id}', this)">
            Save
        </button>

        <button class="cancel-btn"
            onclick="cancelInlineEdit('${id}')">
            Cancel
        </button>

        <button class="delete-btn"
            onclick="deleteProduct('${id}')">
            Delete
        </button>
    `;
};
/*--------------------------ADD SAVE FUNCTION START--------------------------*/


window.cancelInlineEdit = function(id){

    const product = allProducts.find(p => p.id === id);
    if(!product) return;

    const card =
        document.querySelector(`[data-id="${id}"]`);
    if(!card) return;

    card.innerHTML = `
<div class="product-row">

    <div class="product-image-box">
        <img src="${product.image}" class="clickable-image"
            onclick="openImageModal('${product.image}', '${id}')">
    </div>

    <div class="product-details">

        <div class="product-description">
            ${product.description}
        </div>

        <div class="product-bottom">

            <div class="product-price">
                ₹${product.price}
            </div>

            <div class="product-actions">
                <button class="edit-btn"
                    onclick="editProduct('${id}')">Edit</button>

                <button class="delete-btn"
                    onclick="deleteProduct('${id}')">Delete</button>
            </div>

        </div>

    </div>

</div>
`;
};
/*--------------------------ADD SAVE FUNCTION END--------------------------*/
/*--------------------------ADD IMAGE PREVIEW FUNCTION--------------------------*/
window.previewInlineImage = function(event,input){

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
        input.parentElement
            .querySelector(".preview-inline")
            .src = e.target.result;
    };

    reader.readAsDataURL(file);
};
/* ================= SAVE INLINE EDIT (ADMIN) ================= */

window.saveInlineEdit = async function(id, btn){

    try {

        const card = document.querySelector(`[data-id="${id}"]`);
        if(!card) return;

        const descInput = card.querySelector(".desc-input");
        const priceInput = card.querySelector(".price-input");
        const fileInput = card.querySelector(".image-input");

        const newDescription = descInput.value.trim();
        const newPrice = parseFloat(priceInput.value);

        if(!newDescription || !newPrice){
            alert("Fill all fields");
            return;
        }

        let updateData = {
            description: newDescription,
            price: newPrice
        };

        /* ===== IMAGE UPDATE ===== */
        if(fileInput && fileInput.files.length > 0){

            const file = fileInput.files[0];

            // get old product
            const snap = await getDoc(doc(db,"products",id));

            if(snap.exists()){
                const data = snap.data();

                // delete old image
                if(data.imagePath){
                    const oldRef = ref(storage, data.imagePath);
                    await deleteObject(oldRef);
                }
            }

            // upload new image
            const imageRef = ref(
                storage,
                "products/" + Date.now() + "_" + file.name
            );

            const compressedImage = await compressImage(file,30);
            await uploadBytes(imageRef, compressedImage);

            const imageURL = await getDownloadURL(imageRef);

            updateData.image = imageURL;
            updateData.imagePath = imageRef.fullPath;
        }

        // 🔥 UPDATE FIRESTORE
        await updateDoc(doc(db,"products",id), updateData);

        alert("Product updated ✅");

    } catch(error){
        console.error(error);
        alert("Update failed");
    }
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
// ⭐ NEW — smart realtime cache
let productMap = new Map();
// ================= PRODUCT SHUFFLE SYSTEM =================

function shuffleArray(array) {
    const arr = [...array]; // avoid modifying original
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function shouldShuffle() {
    const last = localStorage.getItem("lastShuffleTime");
    if (!last) return true;

    const diff = Date.now() - Number(last);
    return diff > 30 * 60 * 1000; // 30 minutes
}

function saveShuffleTime() {
    localStorage.setItem("lastShuffleTime", Date.now());
}
// ================= PRODUCT SHUFFLE SYSTEM =================
onSnapshot(collection(db, "products"), (snapshot) => {

    snapshot.docChanges().forEach(change => {

        const id = change.doc.id;
        const data = change.doc.data();

        const product = {
            id,
            position: data.position || 0,
            ...data
        };

        if (change.type === "added") {
            productMap.set(id, product);
        }

        if (change.type === "modified") {
            productMap.set(id, product);
        }

        if (change.type === "removed") {
            productMap.delete(id);

            const oldCard =
                productsContainer.querySelector(`[data-id="${id}"]`);

            if (oldCard) oldCard.remove();
        }
    });

    // map → array
    allProducts = Array.from(productMap.values());

    // keep admin drag order
    allProducts.sort((a,b)=>a.position-b.position);

    // shuffle customers only
    if (!isAdmin && shouldShuffle()) {
        allProducts = shuffleArray(allProducts);
        saveShuffleTime();
    }

    renderProducts();
});

/* ================= SEARCH LOGIC ================= */
function renderProducts(productsList = allProducts) {

    productsContainer.replaceChildren();

    // ✅ Recently viewed priority (CORRECT PLACE)
    if (!isAdmin) {

        const viewed =
            JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        if (viewed.length > 0) {

            productsList = [...productsList].sort((a, b) => {

                const aIndex = viewed.indexOf(a.id);
                const bIndex = viewed.indexOf(b.id);

                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;

                return aIndex - bIndex;
            });
        }
    }

    let found = false;

    productsList.forEach(product => {

        if (
            currentCategory !== "" &&
            product.category !== currentCategory
        ) return;

        renderProductCard(product.id, product);
        found = true;
    });

    if (!found) {
        productsContainer.innerHTML =
            `<div class="no-results">Products not found</div>`;
    }
}
/* ================= SEARCH LOGIC END ================= */
/* ================= IMAGE POPUP LOGIC ================= */

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeImageBtn = document.querySelector(".close-image");

window.openImageModal = function(imageSrc, productId){

    modalImage.src = imageSrc;
    imageModal.style.display = "flex";

    // ✅ Save recently viewed (customer only)
    if (!isAdmin && productId) {

        let viewed =
            JSON.parse(localStorage.getItem("recentlyViewed")) || [];

        // remove duplicate
        viewed = viewed.filter(id => id !== productId);

        // add to front
        viewed.unshift(productId);

        // keep only last 10
        viewed = viewed.slice(0, 10);

        localStorage.setItem(
            "recentlyViewed",
            JSON.stringify(viewed)
        );
    }
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

        if (cartListener) {
            cartListener();
            cartListener = null;
        }

        localStorage.removeItem("customerPhone");
        resetRecaptcha(); 
        updateLoginUI();
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
    myProfileLink.addEventListener("click", async () => {

    const isAdmin = localStorage.getItem("isAdmin") === "true";
    const phone = localStorage.getItem("customerPhone");

    const adminView = document.getElementById("adminCustomersView");

    /* ========= ADMIN ========= */
    if (isAdmin) {

        profileView.style.display = "none";
        profileEdit.style.display = "none";
        adminView.style.display = "block";

        await loadAllCustomersForAdmin();

        openModal(profileModal);
        return;
    }

    /* ========= CUSTOMER ========= */
    if (!phone) {
        alert("Please login first");
        return;
    }

    const snap = await getDoc(doc(db,"customers",phone));

    if (snap.exists()) {
        const data = snap.data();

        profileGreeting.textContent = `Hi ${data.name} 👋`;
        profileAddress.textContent = data.address;

        adminView.style.display="none";
        profileView.style.display="block";
        profileEdit.style.display="none";

        openModal(profileModal);
    }
});
}
/* CUSTOMER LOADER FUNCTION */
async function loadAllCustomersForAdmin(){

    const body = document.getElementById("customersTableBody");
    body.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    const snapshot = await getDocs(collection(db,"customers"));

    body.innerHTML = "";

    let i = 1;

    snapshot.forEach(docSnap => {

        const data = docSnap.data();
        const phone = docSnap.id;

        body.innerHTML += `
            <tr data-phone="${phone}">
                <td>${i++}</td>

                <td class="view-name">${data.name || "-"}</td>

                <td>${phone}</td>

                <td class="view-address">${data.address || "-"}</td>

                <td>
                    <button onclick="editCustomer('${phone}')">Edit</button>
                    <button onclick="deleteCustomerAdmin('${phone}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}
/* CUSTOMER LOADER FUNCTION  END */
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
        await setDoc(
            doc(db, "customers", phone),
            {
                name,
                address
            },
            { merge: true }
        );

            // ✅ Close profile modal
            const profileModal = document.getElementById("profileModal");
            closeModal(profileModal);

            // ✅ Update welcome message
            document.getElementById("welcomeMessage").textContent =
                `Hi ${name} 👋`;

            // ===============================
            // RETURN TO CHECKOUT (NEW PART)
            // ===============================
            const returnToCheckout =
                localStorage.getItem("returnToCheckout");

            if (returnToCheckout === "true") {

                localStorage.removeItem("returnToCheckout");

                const checkoutModal =
                    document.getElementById("checkoutModal");

                // update checkout address text
                document.getElementById("checkoutAddress").textContent =
                    address;

                // reopen checkout
                openModal(checkoutModal);
            }

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
        closeModal(profileModal);
    });
}

document.addEventListener("DOMContentLoaded", function(){

    const phone = localStorage.getItem("customerPhone");

    if(phone){

        // remove old listener
        if (cartListener) cartListener();

        cartListener = onSnapshot(doc(db,"carts",phone),(snap)=>{
            if(snap.exists()){
                cart = snap.data().items || [];
                updateCart();
            }
        });

    } else {
        updateCart();
    }
});
// ================= MAXIMIZE ORDERS MODAL =================

const maximizeBtn = document.getElementById("maximizeOrders");

if (maximizeBtn && isAdmin && ordersModal) {

    maximizeBtn.addEventListener("click", () => {

        ordersModal.classList.toggle("fullscreen");

        // change icon
        if (ordersModal.classList.contains("fullscreen")) {
            maximizeBtn.textContent = "❐";
        } else {
            maximizeBtn.textContent = "□";
        }

    });

}
/* ================= CANCEL ORDER ================= */

window.cancelOrder = async function(id,status){

if(status!=="Order Placed"){
alert("Order cannot be cancelled");
return;
}

if(!confirm("Cancel this order?")) return;

await updateDoc(doc(db,"orders",id),{
    status:"Cancelled",
    cancelledBy:"Customer"
});

alert("Order cancelled");
document.getElementById("myOrdersLink").click();

};
const stickyCheckoutBtn = document.getElementById("stickyCheckoutBtn");

if(stickyCheckoutBtn){
stickyCheckoutBtn.addEventListener("click",function(){
    checkoutBtn.click();
});
}
/* ================= UPDATE ORDER STATUS ================= */

window.updateOrderStatus = async function(id,status){

const isAdmin = localStorage.getItem("isAdmin") === "true";

await updateDoc(doc(db,"orders",id),{
    status: status,
    cancelledBy: status === "Cancelled" ? "Admin" : null,
    lastUpdatedBy: isAdmin ? "Admin" : "System",
    lastUpdatedAt: Date.now()
});

alert("Order status updated");

document.getElementById("myOrdersLink").click();
};


/* ================= DELETE ORDER ================= */

window.deleteOrder = async function(id){

// 🔥 get latest order from Firestore
const orderRef = doc(db,"orders",id);
const snap = await getDoc(orderRef);

if(!snap.exists()){
    alert("Order not found");
    return;
}

const order = snap.data();
const status = order.status;

// ✅ allow only Closed or Cancelled
if(status !== "Closed" && status !== "Cancelled"){
    alert("Only Closed or Cancelled orders can be deleted");
    return;
}

if(!confirm("Delete this order?")) return;

await deleteDoc(orderRef);

alert("Order deleted successfully");

// refresh orders
document.getElementById("myOrdersLink").click();
};

// ================= MODAL ANIMATION HELPERS =================

function openModal(modal) {
    modal.style.display = "flex";

    // allow display render first
    setTimeout(() => {
        modal.classList.add("show");
    }, 10);
}

function closeModal(modal) {
    modal.classList.remove("show");

    setTimeout(() => {
        modal.style.display = "none";
    }, 250);
}

// ================= PREMIUM SPLASH CONTROL =================

window.addEventListener("load", () => {

    const splash = document.getElementById("splashScreen");

    // show only once per browser session
    if (sessionStorage.getItem("splashShown")) {
        splash.style.display = "none";
        return;
    }

    sessionStorage.setItem("splashShown", "true");

    setTimeout(() => {

        splash.classList.add("hide");

        setTimeout(()=>{
            splash.style.display = "none";
        },800);

    }, 2000); // 2 seconds
});
// ================= SEARCH FUNCTIONALITY =================
// SEARCH BAR FUNCTIONALITY
const searchInput = document.querySelector("#searchBar .search-input");

if (searchInput) {
    searchInput.addEventListener("input", function() {
        const query = this.value.trim().toLowerCase();

        const filteredProducts = allProducts.filter(product => {
            return (
                product.description.toLowerCase().includes(query) ||
                (product.category && product.category.toLowerCase().includes(query))
            );
        });

        renderProducts(filteredProducts);
    });
}
// ================= ADD EXPORT FUNCTION =================
function exportCustomersToExcel() {

    const table = document.getElementById("customersExcelTable");

    if (!table) {
        alert("No data to export");
        return;
    }

    // Convert HTML table → worksheet
    const workbook = XLSX.utils.table_to_book(table, {
        sheet: "Customers"
    });

    // Download file
    XLSX.writeFile(
        workbook,
        "Thomas_Traders_Customers.xlsx"
    );
}
// ================= EXPORT ORDERS =================
function exportOrdersToExcel() {

    const table = document.getElementById("adminOrdersTablePanel");

    if (!table) {
        alert("No orders to export");
        return;
    }

    const workbook = XLSX.utils.table_to_book(table, {
        sheet: "Orders"
    });

    XLSX.writeFile(
        workbook,
        "Thomas_Traders_Orders.xlsx"
    );
}

// ================= CONNECT EXPORT BUTTONS =================
document.addEventListener("DOMContentLoaded", () => {

    // Customers Export
    const exportCustomersBtn =
        document.getElementById("exportCustomersBtn");

    if (exportCustomersBtn) {
        exportCustomersBtn.addEventListener(
            "click",
            exportCustomersToExcel
        );
    }

    // Orders Export
    const exportOrdersBtn =
        document.getElementById("exportOrdersBtn");

    if (exportOrdersBtn) {
        exportOrdersBtn.addEventListener(
            "click",
            exportOrdersToExcel
        );
    }

});

/* ================= ADMIN EDIT CUSTOMER ================= */

window.editCustomer = function(phone){

    const row = document.querySelector(`tr[data-phone="${phone}"]`);

    const nameCell = row.querySelector(".view-name");
    const addressCell = row.querySelector(".view-address");

    const originalName = nameCell.textContent;
    const originalAddress = addressCell.textContent;

    nameCell.innerHTML =
        `<input id="editName-${phone}" value="${originalName}">`;

    addressCell.innerHTML =
        `<input id="editAddress-${phone}" value="${originalAddress}">`;

    row.querySelector("td:last-child").innerHTML = `
        <button onclick="saveCustomer('${phone}')">Save</button>
        <button onclick="cancelCustomerEdit('${phone}','${originalName}','${originalAddress}')">Cancel</button>
    `;
};
/* ================= ADD SAVE FUNCTION ================= */
window.saveCustomer = async function(phone){

    const name =
        document.getElementById(`editName-${phone}`).value;

    const address =
        document.getElementById(`editAddress-${phone}`).value;

    try{

        await updateDoc(doc(db,"customers",phone),{
            name,
            address
        });

        alert("Customer updated ✅");

        loadAllCustomersForAdmin();

    }catch(err){
        alert("Update failed");
    }
};
window.cancelCustomerEdit = function(phone,name,address){

    const row = document.querySelector(`tr[data-phone="${phone}"]`);

    row.querySelector(".view-name").textContent = name;
    row.querySelector(".view-address").textContent = address;

    row.querySelector("td:last-child").innerHTML = `
        <button onclick="editCustomer('${phone}')">Edit</button>
        <button onclick="deleteCustomerAdmin('${phone}')">Delete</button>
    `;
};
/* ================= ADD DELETE FUNCTION ================= */
window.deleteCustomerAdmin = async function(phone){

    if(!confirm("Delete this customer?")) return;

    try{

        await deleteDoc(doc(db,"customers",phone));

        alert("Customer deleted");

        loadAllCustomersForAdmin();

    }catch(err){
        alert("Delete failed");
    }
};





























































































































































