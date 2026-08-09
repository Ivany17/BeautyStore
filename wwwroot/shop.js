// ==========================================
// 1. GLOBAL VARIABLES & DOM ELEMENTS
// ==========================================
let editingProductId = null;

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
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
            
            let addToCartBtn = document.createElement('button');
            addToCartBtn.textContent = "Add to the Cart";
            addToCartBtn.classList.add('addToCartBtn');
            newDiv.appendChild(addToCartBtn);
            addToCartBtn.addEventListener('click', async () => {
                let response = await fetch("/api/cart", {
                    method: 'POST',
                    body: JSON.stringify({ id: product.id }),
                    headers: { 'Content-Type': 'application/json' }
                });
                alert(`${product.name} added to the Cart!`);
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
// 3. SEARCH & FILTER FUNCTIONS
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
// 4. EVENT LISTENERS
// ==========================================
searchBtn.addEventListener('click', () => {
    searchProducts();
});

clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    loadProducts("/api/products");
});

dataCategory.forEach(cat => {
    cat.addEventListener('click', () => {
        const category = cat.getAttribute('data-category');
        filterByCategory(category);
    });
});


// ==========================================
// 5. APPLICATION INITIALIZATION
// ==========================================
loadProducts('/api/products');