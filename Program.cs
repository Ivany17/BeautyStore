var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles(); // Якщо хтось зайде на / - шукай index.html
app.UseStaticFiles();  // Віддавай будь-які файли з папки wwwroot

List<Product> products = new List<Product>
{
    new Product{Id = 1, Name = "Lipstick", Price = 100, ImageUrl = "data:image/jpeg;base64,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"},
    new Product{Id = 2, Name = "Indian ink", Price = 200, ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThKc7uKugbE24J625ykzXt8D-T1RW3tRdPOGwUqYkNZwq8sSR6AB-AF_Y&s=10"},
    new Product{Id = 3, Name =  "Foundation", Price = 300, ImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLzyjWF8GWTu_f1qYk13dcj94ODr3iWyrsxGiMcew7RA&s=10"},
};
int nextId = products.Count > 0 ? products.Max(p => p.Id) + 1 : 1;

app.MapGet("/api/products", () => products);

app.MapPost("/api/products", (ProductFromBody productFromBody) =>
{
    Product newProduct = new Product
    {
        Id = nextId++,
        Name = productFromBody.NameFromUser,
        Price = productFromBody.PriceFromUser,
        ImageUrl = productFromBody.ImageUrlFromUser
    };
    products.Add(newProduct);
    return newProduct;
});

app.MapDelete("/api/products/{id}", (int id) =>
{
    var productToRemove = products.FirstOrDefault(p => p.Id == id);
    if (productToRemove != null)
    {
        products.Remove(productToRemove);
    }
    return true;
});

app.MapPut("/api/products/{id}", (int id, ProductFromBody productFromBody) =>
{
    var change = products.FirstOrDefault(p => p.Id == id);
    if (change != null)
    {
        change.Name = productFromBody.NameFromUser;
        change.Price = productFromBody.PriceFromUser;
        change.ImageUrl = productFromBody.ImageUrlFromUser;
    }
    return change;
});


app.Run();

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public double Price { get; set; }
    public string ImageUrl { get; set; } = "";
}

class ProductFromBody
{
    public string NameFromUser { get; set; } = "";
    public double PriceFromUser { get; set; }
    public string ImageUrlFromUser { get; set; } = "";
}