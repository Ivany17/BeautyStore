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
        
        let editBtn = document.createElement('button');
        editBtn.textContent = "Edit";
        editBtn.classList.add('editBtn');
        newDiv.appendChild(editBtn);
        editBtn.addEventListener('click', () => {
            editProduct(product);
        });
        
        let deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add('deleteBtn');
        newDiv.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', () => {
            deleteProduct(product.id);
        });
        
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

async function deleteProduct(id){
    try {
        if(!confirm("Are you sure?")){
            return;
        }
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE'});
        if(response.ok){
            loadProducts('/api/products');
        }
    } catch (error) {
        console.log(error);
    }
}

async function editProduct(product){
    try {
        let modalOverlay = document.querySelector('.modal-overlay');
        let changeName = document.getElementById('changeName');
        let changePrice = document.getElementById('changePrice');
        let changeImage = document.getElementById('changeImage');

        changeName.value = product.name;
        changePrice.value = product.price;
        changeImage.value = product.imageUrl;

        editingProductId = product.id;

        modalOverlay.style.display = "flex";

        document.addEventListener('keydown', (e) =>{
            if(modalOverlay.style.display === "flex"){
                if(e.key === 'Escape'){
                    closeModal();
                }
            }
        });
        document.addEventListener('keydown', (e) => {
            if(modalOverlay.style.display === "flex"){
                if(e.key === 'Enter'){
                    saveChanges();
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
}

function closeModal(){
    let modalOverlay = document.querySelector('.modal-overlay');
    modalOverlay.style.display = "none";
}

let cancelChangesBtn = document.getElementById('cancelChangesBtn');
cancelChangesBtn.addEventListener('click', () => {
    closeModal();
});

async function saveChanges() {
    try {
        let changeName = document.getElementById('changeName');
        let changePrice = document.getElementById('changePrice');
        let changeImage = document.getElementById('changeImage');

        let newName = changeName.value;
        let newPrice = parseFloat(changePrice.value);
        let newImage = changeImage.value;

        const response = await fetch(`/api/products/${editingProductId}`, {
            method: 'PUT',
            body: JSON.stringify({
                nameFromUser: newName,
                priceFromUser: newPrice,
                imageUrlFromUser: newImage,
            }),
            headers: { 'Content-Type': 'application/json' },
        });
        if(response.ok){
            loadProducts("/api/products");
            closeModal();
        }
    } catch (error) {
        console.log(error);
    }
}

let saveChangesBtn = document.getElementById('saveChangesBtn');
saveChangesBtn.addEventListener('click', () => {
    saveChanges();
});

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