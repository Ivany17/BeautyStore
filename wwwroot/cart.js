const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const dataCategory = document.querySelectorAll('[data-category]');

async function loadCart(apiUrl, currentPage = 1, pageSize = 25) {
    try {
        let response = await fetch(`${apiUrl}?page=${currentPage}&pageSize=${pageSize}`);
        let value = await response.json();
        console.log(value);
        renderPagination(currentPage, value.totalPages)
        showCartProducts(value.products);
        updateCartTotal();
    } catch (error) {
        console.log(error);
    }
}

function showCartProducts(products) {
    const container = document.getElementById('productContainer');
    container.innerHTML = "";
    if (products.length === 0){
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = `No products found`;
        container.appendChild(emptyMessage);
    } else {
        products.forEach(product => {
            let newDiv = document.createElement('div');
            newDiv.classList.add('product-card');
            
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
            infoPrice.textContent = `${product.productItem.price} грн`
            productInfo.appendChild(infoPrice);
            
            let checkbox= document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('checkbox');
            newDiv.appendChild(checkbox);

            let quantityContainer = document.createElement('div');
            quantityContainer.classList.add('quantity-container');

            let minusBtn = document.createElement('button');
            minusBtn.classList.add('minusBtn');
            minusBtn.textContent = '-';
            minusBtn.addEventListener('click', async () => {
                if(product.quantity - 1 < 1){
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
        if(currentPage > 1){
            currentPage--;
        }
        loadCart('/api/cart', currentPage, pageSize);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = `Next`;
    pagination.appendChild(nextBtn);
    nextBtn.addEventListener('click', () => {
        if(currentPage < totalPages){
            currentPage++;
        }
        loadCart('/api/cart', currentPage, pageSize);
    });
}

const cartTotal = document.getElementById('cart-total'); 
async function updateCartTotal() {
    let getResponse = await fetch('/api/cart?page=1&pageSize=1000');
    let value = await getResponse.json();
    let total = 0;
    value.products.forEach(p => {
        let totalSum = p.productItem.price * p.quantity;
        total += totalSum;
    });
    cartTotal.textContent = `Total: ${total} hrn`;
}

// ==========================================
// 3. SEARCH & FILTER FUNCTIONS
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
    if(category === "All"){
        showCartProducts(data.products)
    } else {
        const filteredData = data.products.filter(d => d.productItem.category === category);
        showCartProducts(filteredData);
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
    loadCart("/api/cart");
});

dataCategory.forEach(cat => {
    cat.addEventListener('click', () => {
        const category = cat.getAttribute('data-category');
        filterByCategory(category);
    });
});

loadCart('/api/cart');