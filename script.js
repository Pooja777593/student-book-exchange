"use strict";

/* =========================================================
   1. Initial book data

   Each book has a unique id. The same id is used when the
   book is added to the shopping cart.
   ========================================================= */

const defaultBooks = [
    {
        id: "java-programming",
        name: "Java Programming",
        author: "Herbert Schildt",
        originalPrice: 850,
        sellingPrice: 599,
        status: "New",
        condition: "Excellent",
        image: "[placehold.co](https://placehold.co/400x560/F97316/FFFFFF?text=Java%0AProgramming)"
    },
    {
        id: "python-programming",
        name: "Python Programming",
        author: "Reema Thareja",
        originalPrice: 750,
        sellingPrice: 449,
        status: "Used",
        condition: "Good",
        image: "[placehold.co](https://placehold.co/400x560/2563EB/FFFFFF?text=Python%0AProgramming)"
    },
    {
        id: "engineering-mathematics",
        name: "Engineering Mathematics",
        author: "B. S. Grewal",
        originalPrice: 995,
        sellingPrice: 650,
        status: "Used",
        condition: "Like New",
        image: "[placehold.co](https://placehold.co/400x560/7C3AED/FFFFFF?text=Engineering%0AMathematics)"
    },
    {
        id: "data-structures",
        name: "Data Structures",
        author: "Seymour Lipschutz",
        originalPrice: 680,
        sellingPrice: 499,
        status: "New",
        condition: "Excellent",
        image: "[placehold.co](https://placehold.co/400x560/059669/FFFFFF?text=Data%0AStructures)"
    },
    {
        id: "operating-systems",
        name: "Operating Systems",
        author: "Abraham Silberschatz",
        originalPrice: 920,
        sellingPrice: 575,
        status: "Used",
        condition: "Good",
        image: "[placehold.co](https://placehold.co/400x560/DB2777/FFFFFF?text=Operating%0ASystems)"
    },
    {
        id: "database-management-systems",
        name: "Database Management Systems",
        author: "Raghu Ramakrishnan",
        originalPrice: 880,
        sellingPrice: 625,
        status: "New",
        condition: "Excellent",
        image: "[placehold.co](https://placehold.co/400x560/0F766E/FFFFFF?text=Database%0AManagement)"
    }
];

/* =========================================================
   2. Application state and localStorage

   JSON.parse converts stored text back to JavaScript data.
   If no saved data exists, an empty array is used.
   ========================================================= */

let cart = readLocalStorage("studentBookCart");
let submittedBooks = readLocalStorage("studentSubmittedBooks");

let currentFilter = "All";
let searchText = "";

function readLocalStorage(key) {
    try {
        const savedValue = localStorage.getItem(key);

        if (!savedValue) {
            return [];
        }

        const parsedValue = JSON.parse(savedValue);

        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
        console.error(`Could not read ${key} from localStorage:`, error);
        return [];
    }
}

function saveCart() {
    localStorage.setItem("studentBookCart", JSON.stringify(cart));
}

function saveSubmittedBooks() {
    try {
        localStorage.setItem(
            "studentSubmittedBooks",
            JSON.stringify(submittedBooks)
        );

        return true;
    } catch (error) {
        console.error("Could not save submitted books:", error);
        return false;
    }
}

/*
   This function always returns the latest list of books,
   including student-submitted books.
*/
function getAllBooks() {
    return [...defaultBooks, ...submittedBooks];
}

/* =========================================================
   3. Common page elements
   ========================================================= */

const bookGrid = document.getElementById("bookGrid");
const noBooksMessage = document.getElementById("noBooksMessage");

const bookSearchInput = document.getElementById("bookSearchInput");
const heroSearchInput = document.getElementById("heroSearchInput");
const heroSearchForm = document.getElementById("heroSearchForm");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const summaryItemCount = document.getElementById("summaryItemCount");

const checkoutButton = document.getElementById("checkoutButton");
const clearCartButton = document.getElementById("clearCartButton");
const checkoutMessage = document.getElementById("checkoutMessage");

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

const toast = document.getElementById("toast");

let toastTimer;

/* =========================================================
   4. Utility functions
   ========================================================= */

/*
   Convert a number to Indian currency.
   Example: 599 becomes ₹599
*/
function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(price));
}

/*
   Escape user-provided text before inserting it into HTML.
   This prevents text such as <script> from being treated as HTML.
*/
function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message) {
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}

function showFormMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

function clearFormMessage(element) {
    element.textContent = "";
    element.className = "form-message";
}

/* =========================================================
   5. Display and search books
   ========================================================= */

function renderBooks() {
    const allBooks = getAllBooks();
    const normalizedSearch = searchText.toLowerCase().trim();

    const matchingBooks = allBooks.filter(function (book) {
        const matchesSearch =
            book.name.toLowerCase().includes(normalizedSearch) ||
            book.author.toLowerCase().includes(normalizedSearch);

        const matchesFilter =
            currentFilter === "All" || book.status === currentFilter;

        return matchesSearch && matchesFilter;
    });

    bookGrid.innerHTML = "";

    if (matchingBooks.length === 0) {
        noBooksMessage.classList.remove("hidden");
        return;
    }

    noBooksMessage.classList.add("hidden");

    matchingBooks.forEach(function (book) {
        const card = document.createElement("article");
        const statusClass =
            book.status === "New" ? "status-new" : "status-used";

        card.className = "book-card";

        card.innerHTML = `
            <div class="book-image-wrapper">
                <img
                    class="book-image"
                    src="${escapeHTML(book.image)}"
                    alt="${escapeHTML(book.name)} book cover"
                >

                <span class="status-badge ${statusClass}">
                    ${escapeHTML(book.status)}
                </span>
            </div>

            <div class="book-content">
                <h3>${escapeHTML(book.name)}</h3>

                <p class="book-author">
                    by ${escapeHTML(book.author)}
                </p>

                <p class="book-condition">
                    <i class="fa-solid fa-circle-check"></i>
                    Condition: ${escapeHTML(book.condition)}
                </p>

                <div class="book-price-row">
                    <span class="original-price">
                        ${formatPrice(book.originalPrice)}
                    </span>

                    <span class="selling-price">
                        ${formatPrice(book.sellingPrice)}
                    </span>
                </div>

                <button
                    class="primary-button add-to-cart-button"
                    type="button"
                    data-book-id="${escapeHTML(book.id)}"
                >
                    <i class="fa-solid fa-cart-plus"></i>
                    Add to Cart
                </button>

                ${
                    book.sellerName
                        ? `
                            <p class="seller-note">
                                Listed by ${escapeHTML(book.sellerName)}
                            </p>
                        `
                        : ""
                }
            </div>
        `;

        bookGrid.appendChild(card);
    });
}

function updateFilterButtons() {
    const buttons = document.querySelectorAll(".filter-button");

    buttons.forEach(function (button) {
        const buttonFilter = button.dataset.filter;

        button.classList.toggle(
            "active",
            buttonFilter === currentFilter
        );
    });
}

/*
   Search while typing in the Buy Books search box.
*/
bookSearchInput.addEventListener("input", function () {
    searchText = bookSearchInput.value;
    renderBooks();
});

/*
   Search from the large search box on the homepage.
*/
heroSearchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    searchText = heroSearchInput.value.trim();
    bookSearchInput.value = searchText;

    currentFilter = "All";
    updateFilterButtons();
    renderBooks();

    document
        .getElementById("buy-books")
        .scrollIntoView({ behavior: "smooth" });
});

/*
   Filter buttons in the Buy Books toolbar.
*/
document.querySelectorAll(".filter-button").forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        updateFilterButtons();
        renderBooks();
    });
});

/*
   Category cards also filter the books.
*/
document.querySelectorAll(".category-card").forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        searchText = "";

        bookSearchInput.value = "";
        heroSearchInput.value = "";

        updateFilterButtons();
        renderBooks();

        document
            .getElementById("buy-books")
            .scrollIntoView({ behavior: "smooth" });
    });
});

/*
   Event delegation handles every current and future
   Add to Cart button inside the book grid.
*/
bookGrid.addEventListener("click", function (event) {
    const addButton = event.target.closest(".add-to-cart-button");

    if (!addButton) {
        return;
    }

    addToCart(addButton.dataset.bookId);
});

/* =========================================================
   6. Shopping cart
   ========================================================= */

function addToCart(bookId) {
    const selectedBook = getAllBooks().find(function (book) {
        return book.id === bookId;
    });

    if (!selectedBook) {
        showToast("This book could not be found.");
        return;
    }

    const existingCartItem = cart.find(function (item) {
        return item.id === bookId;
    });

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        /*
           The book details are copied into the cart so the saved
           cart remains usable even after the browser is reopened.
        */
        cart.push({
            id: selectedBook.id,
            name: selectedBook.name,
            author: selectedBook.author,
            sellingPrice: Number(selectedBook.sellingPrice),
            image: selectedBook.image,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
    showToast(`${selectedBook.name} added to the cart.`);
}

function changeQuantity(bookId, amount) {
    const cartItem = cart.find(function (item) {
        return item.id === bookId;
    });

    if (!cartItem) {
        return;
    }

    cartItem.quantity += amount;

    if (cartItem.quantity <= 0) {
        cart = cart.filter(function (item) {
            return item.id !== bookId;
        });
    }

    saveCart();
    renderCart();
}

function removeFromCart(bookId) {
    const itemToRemove = cart.find(function (item) {
        return item.id === bookId;
    });

    cart = cart.filter(function (item) {
        return item.id !== bookId;
    });

    saveCart();
    renderCart();

    if (itemToRemove) {
        showToast(`${itemToRemove.name} removed from the cart.`);
    }
}

function getCartTotals() {
    return cart.reduce(
        function (totals, item) {
            totals.quantity += item.quantity;
            totals.price += item.sellingPrice * item.quantity;
            return totals;
        },
        {
            quantity: 0,
            price: 0
        }
    );
}

function renderCart() {
    cartItems.innerHTML = "";

    /*
       Remove invalid saved entries before displaying the cart.
       This makes the application safer if localStorage is edited.
    */
    cart = cart.filter(function (item) {
        return (
            item &&
            item.id &&
            item.name &&
            Number(item.sellingPrice) >= 0 &&
            Number(item.quantity) > 0
        );
    });

    saveCart();

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>Your cart is empty</h3>
                <p>Add books from the collection to see them here.</p>

                <a href="#buy-books" class="primary-button">
                    Explore Books
                </a>
            </div>
        `;
    } else {
        cart.forEach(function (item) {
            const cartItemElement = document.createElement("article");

            cartItemElement.className = "cart-item";

            cartItemElement.innerHTML = `
                <img
                    class="cart-item-image"
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.name)} book cover"
                >

                <div class="cart-item-details">
                    <h3>${escapeHTML(item.name)}</h3>
                    <p>by ${escapeHTML(item.author)}</p>

                    <p class="cart-item-price">
                        ${formatPrice(item.sellingPrice)} each
                    </p>
                </div>

                <div
                    class="quantity-controls"
                    aria-label="Quantity controls for ${escapeHTML(item.name)}"
                >
                    <button
                        type="button"
                        class="quantity-button"
                        data-action="decrease"
                        data-book-id="${escapeHTML(item.id)}"
                        aria-label="Decrease quantity"
                    >
                        <i class="fa-solid fa-minus"></i>
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        type="button"
                        class="quantity-button"
                        data-action="increase"
                        data-book-id="${escapeHTML(item.id)}"
                        aria-label="Increase quantity"
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <button
                    type="button"
                    class="remove-button"
                    data-action="remove"
                    data-book-id="${escapeHTML(item.id)}"
                    aria-label="Remove ${escapeHTML(item.name)}"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            cartItems.appendChild(cartItemElement);
        });
    }

    const totals = getCartTotals();

    cartCount.textContent = totals.quantity;
    summaryItemCount.textContent = totals.quantity;
    cartTotal.textContent = formatPrice(totals.price);
}

/*
   One click listener handles increase, decrease and remove.
*/
cartItems.addEventListener("click", function (event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
        return;
    }

    const bookId = actionButton.dataset.bookId;
    const action = actionButton.dataset.action;

    if (action === "increase") {
        changeQuantity(bookId, 1);
    }

    if (action === "decrease") {
        changeQuantity(bookId, -1);
    }

    if (action === "remove") {
        removeFromCart(bookId);
    }
});

clearCartButton.addEventListener("click", function () {
    clearFormMessage(checkoutMessage);

    if (cart.length === 0) {
        showToast("The cart is already empty.");
        return;
    }

    const shouldClear = window.confirm(
        "Are you sure you want to remove all books from the cart?"
    );

    if (shouldClear) {
        cart = [];
        saveCart();
        renderCart();
        showToast("The shopping cart has been cleared.");
    }
});

checkoutButton.addEventListener("click", function () {
    clearFormMessage(checkoutMessage);

    if (cart.length === 0) {
        showFormMessage(
            checkoutMessage,
            "Please add at least one book before checkout.",
            "error"
        );
        return;
    }

    showFormMessage(
        checkoutMessage,
        "Checkout successful for this project demonstration!",
        "success"
    );

    cart = [];
    saveCart();
    renderCart();
});

/* =========================================================
   7. Sell-book form
   ========================================================= */

const sellBookForm = document.getElementById("sellBookForm");
const sellFormMessage = document.getElementById("sellFormMessage");
const bookImageInput = document.getElementById("bookImage");

sellBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFormMessage(sellFormMessage);

    /*
       reportValidity displays the browser's built-in messages for
       empty fields, invalid numbers and invalid phone numbers.
    */
    if (!sellBookForm.checkValidity()) {
        sellBookForm.reportValidity();
        return;
    }

    const selectedImage = bookImageInput.files[0];

    if (!selectedImage) {
        showFormMessage(
            sellFormMessage,
            "Please select a book image.",
            "error"
        );
        return;
    }

    if (!selectedImage.type.startsWith("image/")) {
        showFormMessage(
            sellFormMessage,
            "Please upload a valid image file.",
            "error"
        );
        return;
    }

    /*
       Images are stored as text in localStorage. A 1 MB limit
       helps avoid exceeding the browser's localStorage limit.
    */
    const maximumImageSize = 1024 * 1024;

    if (selectedImage.size > maximumImageSize) {
        showFormMessage(
            sellFormMessage,
            "The image is too large. Please choose an image below 1 MB.",
            "error"
        );
        return;
    }

    const formData = new FormData(sellBookForm);
    const fileReader = new FileReader();

    fileReader.addEventListener("load", function () {
        const price = Number(formData.get("price"));
        const uniqueId = `student-book-${Date.now()}`;

        const newBook = {
            id: uniqueId,
            name: formData.get("bookName").trim(),
            author: formData.get("authorName").trim(),
            originalPrice: Math.ceil(price * 1.25),
            sellingPrice: price,
            status: "Used",
            condition: formData.get("condition"),
            image: fileReader.result,
            sellerName: formData.get("sellerName").trim(),
            contact: formData.get("contact").trim()
        };

        submittedBooks.push(newBook);

        const wasSaved = saveSubmittedBooks();

        if (!wasSaved) {
            submittedBooks.pop();

            showFormMessage(
                sellFormMessage,
                "The book could not be saved. Try a smaller image.",
                "error"
            );
            return;
        }

        currentFilter = "All";
        searchText = "";

        bookSearchInput.value = "";
        heroSearchInput.value = "";

        updateFilterButtons();
        renderBooks();
        sellBookForm.reset();

        showFormMessage(
            sellFormMessage,
            "Your book was submitted and added to the available books!",
            "success"
        );

        showToast("New used book added successfully.");
    });

    fileReader.addEventListener("error", function () {
        showFormMessage(
            sellFormMessage,
            "The image could not be read. Please select another image.",
            "error"
        );
    });

    fileReader.readAsDataURL(selectedImage);
});

/* =========================================================
   8. Exchange form
   ========================================================= */

const exchangeForm = document.getElementById("exchangeForm");
const exchangeFormMessage = document.getElementById(
    "exchangeFormMessage"
);

exchangeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFormMessage(exchangeFormMessage);

    if (!exchangeForm.checkValidity()) {
        exchangeForm.reportValidity();
        return;
    }

    showFormMessage(
        exchangeFormMessage,
        "Exchange request submitted successfully! The details are ready for review.",
        "success"
    );

    exchangeForm.reset();
});

/* =========================================================
   9. Contact form
   ========================================================= */

const contactForm = document.getElementById("contactForm");
const contactFormMessage = document.getElementById(
    "contactFormMessage"
);

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFormMessage(contactFormMessage);

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    showFormMessage(
        contactFormMessage,
        "Thank you! Your message was submitted successfully.",
        "success"
    );

    contactForm.reset();
});

/* =========================================================
   10. Responsive navigation
   ========================================================= */

menuButton.addEventListener("click", function () {
    const menuIsOpen = navLinks.classList.toggle("open");

    document.body.classList.toggle("menu-open", menuIsOpen);
    menuButton.setAttribute("aria-expanded", String(menuIsOpen));

    menuButton.innerHTML = menuIsOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
});

function closeMobileMenu() {
    navLinks.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
}

/*
   Close the mobile menu after changing to desktop width.
*/
window.addEventListener("resize", function () {
    if (window.innerWidth > 1050) {
        closeMobileMenu();
    }
});

/* =========================================================
   11. Initial page setup
   ========================================================= */

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

renderBooks();
renderCart();
