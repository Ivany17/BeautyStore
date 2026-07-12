let editingProductId = null;

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');

async function searchProducts() {
    const searchText = searchInput.value;
    const getResult = await fetch(`/api/products`);
    const data = await getResult.json();
    const filteredProducts = data.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
    showProducts(filteredProducts);
}
searchBtn.addEventListener('click', () => {
    searchProducts();
});
clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    loadProducts("/api/products");
});

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
        
        let infoName = document.createElement('h3');
        infoName.textContent = `${product.name}`;
        newDiv.appendChild(infoName);

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