using Microsoft.EntityFrameworkCore;

// ==========================================
// 1. APPLICATION SETUP & MIDDLEWARE
// ==========================================
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>();
var app = builder.Build();

app.UseDefaultFiles(); // Якщо хтось зайде на / - шукай index.html
app.UseStaticFiles();  // Віддавай будь-які файли з папки wwwroot

List<CartItem> cart = new List<CartItem> { };


// ==========================================
// 2. PRODUCTS API ENDPOINTS
// ==========================================
app.MapGet("/api/products", (AppDbContext dbContext, int page, int pageSize) =>
{
    var totalProducts = dbContext.Products.Count();
    var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);
    var productsOnThePage = dbContext.Products.OrderByDescending(p => p.Id).Skip((page - 1) * pageSize).Take(pageSize).ToList();
    return new
    {
        Products = productsOnThePage,
        TotalPages = totalPages,
    };
});

app.MapGet("/api/products/{id}", (AppDbContext dbContext, int id) =>
{
    var product = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (product == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(product);
});

app.MapPost("/api/products", async (AppDbContext dbContext, ProductFromBody productFromBody) =>
{
    Product newProduct = new Product
    {
        Name = productFromBody.NameFromUser,
        Price = productFromBody.PriceFromUser,
        ImageUrl = productFromBody.ImageUrlFromUser,
        Category = productFromBody.CategoryFromUser,
    };
    dbContext.Products.Add(newProduct);
    await dbContext.SaveChangesAsync();
    return newProduct;
});

app.MapPut("/api/products/{id}", async (AppDbContext dbContext, int id, ProductFromBody productFromBody) =>
{
    var change = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (change != null)
    {
        change.Name = productFromBody.NameFromUser;
        change.Price = productFromBody.PriceFromUser;
        change.ImageUrl = productFromBody.ImageUrlFromUser;
        change.Category = productFromBody.CategoryFromUser;
    }
    await dbContext.SaveChangesAsync();
    return change;
});

app.MapDelete("/api/products/{id}", async (AppDbContext dbContext, int id) =>
{
    var productToRemove = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (productToRemove != null)
    {
        dbContext.Products.Remove(productToRemove);
    }
    await dbContext.SaveChangesAsync();
    return true;
});


// ==========================================
// 3. CART API ENDPOINTS
// ==========================================
app.MapGet("/api/cart", (AppDbContext dbContext, int page, int pageSize) =>
{
    var totalProducts = cart.Count();
    var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);
    var productsOnThePage = cart.OrderByDescending(p => p.AddedAt).Skip((page - 1) * pageSize).Take(pageSize).ToList();
    return new
    {
        Products = productsOnThePage,
        TotalPages = totalPages,
    };
});

app.MapPost("/api/cart", (AppDbContext dbContext, AddToCartRequest request) =>
{
    var productsInTheCart = dbContext.Products.FirstOrDefault(p => p.Id == request.Id);
    var existingCartItem = cart.FirstOrDefault(c => c.ProductItem!.Id == request.Id);
    CartItem newCartItem = new CartItem
    {
        ProductItem = productsInTheCart,
        AddedAt = DateTime.Now
    };
    if (productsInTheCart != null)
    {
        if (existingCartItem != null)
        {
            existingCartItem.Quantity++;
        }
        else
        {
            cart.Add(newCartItem);
            newCartItem.Quantity = 1;
        }
        return Results.Ok();
    }
    else
    {
        return Results.NotFound();
    }
});

app.MapPut("/api/cart/{id}", async (AppDbContext dbContext, int id, UpdateQuantityRequest request) =>
{
    var newQuantity = cart.FirstOrDefault(p => p.ProductItem!.Id == id);
    if (newQuantity != null)
    {
        newQuantity.Quantity = request.UpdateQuantity;
    }
    await dbContext.SaveChangesAsync();
    return newQuantity;
});

app.MapDelete("/api/cart/{id}", async (AppDbContext dbContext, int id) =>
{
    var removeFromTheCart = cart.FirstOrDefault(p => p.ProductItem!.Id == id);
    if (removeFromTheCart != null)
    {
        cart.Remove(removeFromTheCart);
    }
    await dbContext.SaveChangesAsync();
    return true;
});

app.MapPost("/api/cart/remove-many", async (AppDbContext dbContext, RemoveManyRequest removeManyRequest) =>
{
    foreach (var id in removeManyRequest.Ids)
    {
        var removeAfterTheBuying = cart.FirstOrDefault(p => p.ProductItem!.Id == id);
        if (removeAfterTheBuying != null)
        {
            cart.Remove(removeAfterTheBuying);
        }
    }
    await dbContext.SaveChangesAsync();
    return true;
});


// ==========================================
// 4. RUN APPLICATION
// ==========================================
app.Run();


// ==========================================
// 5. DATA MODELS & REQUEST DTOs
// ==========================================
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public double Price { get; set; }
    public string ImageUrl { get; set; } = "";
    public string Category { get; set; } = "";
}

class ProductFromBody
{
    public string NameFromUser { get; set; } = "";
    public double PriceFromUser { get; set; }
    public string ImageUrlFromUser { get; set; } = "";
    public string CategoryFromUser { get; set; } = "";
}

class CartItem
{
    public int Id { get; set; }
    public Product? ProductItem { get; set; } // added the ? to avoid the yellow line
    public DateTime AddedAt { get; set; }
    public int Quantity { get; set; }
}

class AddToCartRequest
{
    public int Id { get; set; }
}

class UpdateQuantityRequest
{
    public int UpdateQuantity { get; set; }
}

class RemoveManyRequest
{
    public List<int> Ids { get; set; } = new List<int>();
}