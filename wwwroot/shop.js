let editingProductId = null;

function showProducts(products) {
    const container = document.getElementById('productContainer');
    container.innerHTML = "";
    products.forEach(product => {
        let newDiv = document.createElement('div');
        newDiv.classList.add('product-card');
        
        let image = document.createElement('img');
        image.src = product.imageUrl;
        image.alt = product.name;
        newDiv.appendChild(image);
        
        let info = document.createElement('p');
        info.textContent = `${product.name} - ${product.price} грн`;
        newDiv.appendChild(info);
        
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

async function loadProducts(apiUrl) {
    try {
        let response = await fetch(apiUrl);
        let value = await response.json();
        console.log(value);
        showProducts(value);
    } catch (error) {
        console.log(error);
    }
}

loadProducts('/api/products');