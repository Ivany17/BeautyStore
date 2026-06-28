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
        
        let editBtn = document.createElement('button');
        editBtn.textContent = "Edit";
        editBtn.classList.add('editBtn');
        newDiv.appendChild(editBtn);
        
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add('deleteBtn');
        newDiv.appendChild(deleteBtn);
        
        container.appendChild(newDiv);
    });
}

async function addProduct(){
    let nameInput = document.getElementById('productName');
    let priceInput = document.getElementById('productPrice');
    let imageInput = document.getElementById('productImage');

    let name = nameInput.value;
    let price = parseInt(priceInput.value);
    let imageUrl = imageInput.value;
    
    if(name === "" || price <= 0 || isNaN(price) || imageUrl === ""){
        alert("Будь ласка, заповніть всі поля");
    } else {
            let response = await fetch("/api/products", {
                method: 'POST',
                body: JSON.stringify({
                    nameFromUser: name,
                    priceFromUser: price,
                    imageUrlFromUser: imageUrl,
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            nameInput.value = "";
            priceInput.value = "";
            imageInput.value = "";
            loadProducts('/api/products');
    }
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

const addBtn = document.getElementById('addBtn');
addBtn.addEventListener('click', () => {
    addProduct();
});