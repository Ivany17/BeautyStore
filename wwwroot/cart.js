async function loadCart(apiUrl, currentPage = 1, pageSize = 25) {
    try {
        let response = await fetch(`${apiUrl}?page=${currentPage}&pageSize=${pageSize}`);
        let value = await response.json();
        renderPagination(currentPage, value.totalPages)
        showCartProducts(value.products);
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
            image.src = product.imageUrl;
            image.alt = product.name;
            newDiv.appendChild(image);
            
            let infoName = document.createElement('h3');
            infoName.textContent = `${product.name}`;
            newDiv.appendChild(infoName);

            let infoCategory = document.createElement('span');
            infoCategory.classList.add('category-tag');
            infoCategory.textContent = `${product.category}`;
            newDiv.appendChild(infoCategory);

            let infoPrice = document.createElement('h4');
            infoPrice.textContent = `${product.price} грн`
            newDiv.appendChild(infoPrice);
            
            let buyBtn = document.createElement('button');
            buyBtn.textContent = "Buy";
            buyBtn.classList.add('buyBtn');
            newDiv.appendChild(buyBtn);
            buyBtn.addEventListener('click', () => {
                alert(`${product.name} додано в кошик!`);
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
        if(currentPage > 1){
            currentPage--;
        }
        loadProducts('/api/products', currentPage, pageSize);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = `Next`;
    pagination.appendChild(nextBtn);
    nextBtn.addEventListener('click', () => {
        if(currentPage < totalPages){
            currentPage++;
        }
        loadProducts('/api/products', currentPage, pageSize);
    });
}

loadCart('/api/cart');