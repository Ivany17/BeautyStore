// ==========================================
// 1. GLOBAL VARIABLES & DOM ELEMENTS
// ==========================================
let editingProductId = null;

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const addBtn = document.getElementById('addBtn');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const cancelChangesBtn = document.getElementById('cancelChangesBtn');
const dataCategory = document.querySelectorAll('[data-category]');


// ==========================================
// 2. CORE FETCHING & RENDERING FUNCTIONS
// ==========================================
async function loadProducts(apiUrl, currentPage = 1, pageSize = 25) {
    try {
        let response = await fetch(`${apiUrl}?page=${currentPage}&pageSize=${pageSize}`);
        let value = await response.json();
        renderPagination(currentPage, value.totalPages, pageSize);
        showProducts(value.products);
    } catch (error) {
        console.log(error);
    }
}

function showProducts(products) {
    const container = document.getElementById('productContainer');
    container.innerHTML = "";
    
    if (products.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = `No products found`;
        container.appendChild(emptyMessage);
    } else {
        products.forEach(product => {
            let newDiv = document.createElement('div');
            newDiv.classList.add('product-card');
            
            let image = document.createElement('img');
            image.src = product.imageUrl;
            image.alt = product.name;
            newDiv.appendChild(image);
            
            let infoName = document.createElement('h3');
            infoName.textContent = `${product.name}`;
            newDiv.appendChild(infoName);

            let productInfo = document.createElement('div');
            productInfo.classList.add('product-info');
            newDiv.appendChild(productInfo);

            let infoCategory = document.createElement('span');
            infoCategory.classList.add('category-tag');
            infoCategory.textContent = `${product.category}`;
            productInfo.appendChild(infoCategory);

            let infoPrice = document.createElement('h4');
            infoPrice.textContent = `${product.price} ₴`;
            productInfo.appendChild(infoPrice);

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('button-container');
            newDiv.appendChild(buttonContainer);
            
            let editBtn = document.createElement('button');
            editBtn.textContent = "Edit";
            editBtn.classList.add('editBtn');
            buttonContainer.appendChild(editBtn);
            editBtn.addEventListener('click', () => {
                editProduct(product);
            });
            
            let deleteBtn = document.createElement('button');
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add('deleteBtn');
            buttonContainer.appendChild(deleteBtn);
            deleteBtn.addEventListener('click', () => {
                deleteProduct(product.id, product.name);
            });
            
            container.appendChild(newDiv);
        });
    }
}

async function renderPagination(currentPage, totalPages, pageSize) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = "";

    const prevBtn = document.createElement('button');
    prevBtn.textContent = `Prev`;
    pagination.appendChild(prevBtn);
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
        }
        loadProducts('/api/products', currentPage, pageSize);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = `Next`;
    pagination.appendChild(nextBtn);
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
        }
        loadProducts('/api/products', currentPage, pageSize);
    });
}


// ==========================================
// 3. PRODUCT MANAGEMENT FUNCTIONS (CRUD & MODAL)
// ==========================================
async function addProduct() {
    let nameInput = document.getElementById('productName');
    let priceInput = document.getElementById('productPrice');
    let imageInput = document.getElementById('productImage');
    let productCategory = document.getElementById('productCategory');

    let name = nameInput.value;
    let price = parseFloat(priceInput.value.replace(',', '.'));
    let imageUrl = imageInput.value;
    let category = productCategory.value;
    
    if (name === "") {
        alert("Please enter the product name.");
        return;
    }
    if (isNaN(price) || price <= 0) {
        alert("Please enter a valid price (must be greater than 0).");
        return;
    }
    if (imageUrl === "") {
        alert("Please enter the image URL.");
        return;
    }
    if (category === "") {
        alert("Please select a category");
        return;
    }

    let response = await fetch("/api/products", {
        method: 'POST',
        body: JSON.stringify({
            nameFromUser: name,
            priceFromUser: price,
            imageUrlFromUser: imageUrl,
            categoryFromUser: category,
        }),
        headers: { 'Content-Type': 'application/json' }
    });

    nameInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    productCategory.value = "";
    loadProducts('/api/products');
}

async function editProduct(product) {
    try {
        let modalOverlay = document.querySelector('.modal-overlay');
        let changeName = document.getElementById('changeName');
        let changePrice = document.getElementById('changePrice');
        let changeImage = document.getElementById('changeImage');

        changeName.value = product.name;
        changePrice.value = product.price;
        changeImage.value = product.imageUrl;

        editingProductId = product.id;

        document.getElementById('changeCategory').value = product.category;

        modalOverlay.style.display = "flex";

        document.addEventListener('keydown', (e) => {
            if (modalOverlay.style.display === "flex") {
                if (e.key === 'Escape') {
                    closeModal();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (modalOverlay.style.display === "flex") {
                if (e.key === 'Enter') {
                    saveChanges();
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

async function saveChanges() {
    try {
        let changeName = document.getElementById('changeName');
        let changePrice = document.getElementById('changePrice');
        let changeImage = document.getElementById('changeImage');
        let changeCategory = document.getElementById('changeCategory');

        let newName = changeName.value;
        let newPrice = parseFloat(changePrice.value);
        let newImage = changeImage.value;
        let newCategory = changeCategory.value;

        const response = await fetch(`/api/products/${editingProductId}`, {
            method: 'PUT',
            body: JSON.stringify({
                nameFromUser: newName,
                priceFromUser: newPrice,
                imageUrlFromUser: newImage,
                categoryFromUser: newCategory,
            }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            loadProducts("/api/products");
            closeModal();
        }
    } catch (error) {
        console.log(error);
    }
}

async function deleteProduct(id, name) {
    try {
        if (!confirm(`Are you sure you want to delete the ${name}?`)) {
            return;
        }
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadProducts('/api/products');
        }
    } catch (error) {
        console.log(error);
    }
}

function closeModal() {
    let modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.style.display = "none";
}


// ==========================================
// 4. SEARCH & FILTER FUNCTIONS
// ==========================================
async function searchProducts() {
    const searchText = searchInput.value;
    const getResult = await fetch(`/api/products?page=1&pageSize=1000`);
    const data = await getResult.json();
    const filteredProducts = data.products.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
    showProducts(filteredProducts);
}

async function filterByCategory(category) {
    const getResult = await fetch(`/api/products?page=1&pageSize=1000`);
    const data = await getResult.json();
    if (category === "All") {
        showProducts(data.products);
    } else {
        const filteredData = data.products.filter(d => d.category === category);
        showProducts(filteredData);
    }
}


// ==========================================
// 5. EVENT LISTENERS
// ==========================================
searchBtn.addEventListener('click', () => {
    searchProducts();
});

clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    loadProducts("/api/products");
});

addBtn.addEventListener('click', () => {
    addProduct();
});

saveChangesBtn.addEventListener('click', () => {
    saveChanges();
});

cancelChangesBtn.addEventListener('click', () => {
    closeModal();
});

dataCategory.forEach(cat => {
    cat.addEventListener('click', () => {
        const category = cat.getAttribute('data-category');
        filterByCategory(category);
    });
});


// ==========================================
// 6. APPLICATION INITIALIZATION
// ==========================================
loadProducts('/api/products');