// ==========================================
// 1. GLOBAL VARIABLES & DOM ELEMENTS
// ==========================================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const dataCategory = document.querySelectorAll('[data-category]');
const cartTotal = document.getElementById('cart-total');
const buyBtn = document.getElementById('buyBtn');


// ==========================================
// 2. CORE FETCHING & RENDERING FUNCTIONS
// ==========================================
async function loadCart(apiUrl, currentPage = 1, pageSize = 25) {
    try {
        let response = await fetch(`${apiUrl}?page=${currentPage}&pageSize=${pageSize}`);
        let value = await response.json();
        console.log(value);
        renderPagination(currentPage, value.totalPages, pageSize);
        showCartProducts(value.products);
        updateCartTotal();
        updateBuyButton();
    } catch (error) {
        console.log(error);
    }
}

function showCartProducts(products) {
    const container = document.getElementById('productContainer');
    container.innerHTML = "";
    
    if (products.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = `Your cart is empty. Add some products!`;
        container.appendChild(emptyMessage);
    } else {
        products.forEach(product => {
            let newDiv = document.createElement('div');
            newDiv.classList.add('product-card');

            let removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-btn');
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => {
                removeFromCart(product.productItem.id, product.productItem.name);
            });
            newDiv.appendChild(removeBtn);
            
            let image = document.createElement('img');
            image.src = product.productItem.imageUrl;
            image.alt = product.productItem.name;
            newDiv.appendChild(image);
            
            let infoName = document.createElement('h3');
            infoName.textContent = `${product.productItem.name}`;
            newDiv.appendChild(infoName);

            let productInfo = document.createElement('div');
            productInfo.classList.add('product-info');
            newDiv.appendChild(productInfo);

            let infoCategory = document.createElement('span');
            infoCategory.classList.add('category-tag');
            infoCategory.textContent = `${product.productItem.category}`;
            productInfo.appendChild(infoCategory);

            let infoPrice = document.createElement('h4');
            infoPrice.textContent = `${product.productItem.price} ₴`;
            infoPrice.classList.add('product-price');
            productInfo.appendChild(infoPrice);
            
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('checkbox');
            checkbox.setAttribute('data-id', product.productItem.id);
            checkbox.addEventListener('change', () => {
                updateBuyButton();
            });
            newDiv.appendChild(checkbox);

            let quantityContainer = document.createElement('div');
            quantityContainer.classList.add('quantity-container');

            let minusBtn = document.createElement('button');
            minusBtn.classList.add('minusBtn');
            minusBtn.textContent = '-';
            minusBtn.addEventListener('click', async () => {
                if (product.quantity - 1 < 1) {
                    quantityItem.textContent = product.quantity;
                } else {
                    let response = await fetch(`/api/cart/${product.productItem.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ updateQuantity: product.quantity - 1 }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    product.quantity--;
                    quantityItem.textContent = product.quantity;
                    updateCartTotal();
                    updateBuyButton();
                }
            });
            quantityContainer.appendChild(minusBtn);

            let quantityItem = document.createElement('span');
            quantityItem.id = `quantity-${product.productItem.id}`;
            quantityItem.classList.add('quantity-number');
            quantityItem.textContent = product.quantity;
            quantityContainer.appendChild(quantityItem);

            let plusBtn = document.createElement('button');
            plusBtn.classList.add('plusBtn');
            plusBtn.textContent = '+';
            plusBtn.addEventListener('click', async () => {
                let response = await fetch(`/api/cart/${product.productItem.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ updateQuantity: product.quantity + 1 }),
                    headers: { 'Content-Type': 'application/json' }
                });
                product.quantity++;
                quantityItem.textContent = product.quantity;
                updateCartTotal();
                updateBuyButton();
            });
            quantityContainer.appendChild(plusBtn);
            newDiv.appendChild(quantityContainer);
            
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
        loadCart('/api/cart', currentPage, pageSize);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = `Next`;
    pagination.appendChild(nextBtn);
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
        }
        loadCart('/api/cart', currentPage, pageSize);
    });
}


// ==========================================
// 3. CART CALCULATIONS & ACTIONS
// ==========================================
async function updateCartTotal() {
    let getResponse = await fetch('/api/cart?page=1&pageSize=1000');
    let value = await getResponse.json();
    let total = 0;
    value.products.forEach(p => {
        let totalSum = p.productItem.price * p.quantity;
        total += totalSum;
    });
    cartTotal.textContent = `Total: ${total} ₴`;
}

function updateBuyButton() {
    const checkboxProducts = document.querySelectorAll('input[type="checkbox"]');
    const checkedProducts = Array.from(checkboxProducts).filter(p => p.checked === true);
    const selectedIds = [];
    let totalPrice = 0;
    
    if (checkedProducts.length === 0) {
        buyBtn.textContent = `Buy for 0 ₴`;
    }
    
    checkedProducts.forEach(product => {
        const id = product.dataset.id;
        const productCard = product.closest('.product-card');
        const productPrice = productCard.querySelector('.product-price');
        const priceText = productPrice.textContent;
        const priceNumber = parseInt(priceText);
        const productQuantity = productCard.querySelector('.quantity-number');
        const quantityText = productQuantity.textContent;
        const quantityNumber = parseInt(quantityText);
        
        totalPrice += priceNumber * quantityNumber;
        buyBtn.textContent = `Buy for ${totalPrice} ₴`;
        selectedIds.push(id);
    });
    return selectedIds;
}

async function removeFromCart(id, name) {
    try {
        if (!confirm(`Are you sure you want to delete the ${name}?`)) {
            return;
        }
        const response = await fetch(`/api/cart/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadCart('/api/cart');
        }
    } catch (error) {
        console.log(error);
    }
}


// ==========================================
// 4. SEARCH & FILTER FUNCTIONS
// ==========================================
async function searchProducts() {
    const searchText = searchInput.value;
    const getResult = await fetch(`/api/cart?page=1&pageSize=1000`);
    const data = await getResult.json();
    const filteredProducts = data.products.filter(p => p.productItem.name.toLowerCase().includes(searchText.toLowerCase()));
    showCartProducts(filteredProducts);
}

async function filterByCategory(category) {
    const getResult = await fetch(`/api/cart?page=1&pageSize=1000`);
    const data = await getResult.json();
    if (category === "All") {
        showCartProducts(data.products);
    } else {
        const filteredData = data.products.filter(d => d.productItem.category === category);
        showCartProducts(filteredData);
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
    loadCart("/api/cart");
});

dataCategory.forEach(cat => {
    cat.addEventListener('click', () => {
        const category = cat.getAttribute('data-category');
        filterByCategory(category);
    });
});

buyBtn.addEventListener('click', async () => {
    const selectedIds = updateBuyButton();
    const PostResponse = await fetch(`/api/cart/remove-many`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Ids: selectedIds,
        }),
    });
    loadCart('/api/cart');
    alert('Purchase successful!');
});


// ==========================================
// 6. APPLICATION INITIALIZATION
// ==========================================
loadCart('/api/cart');