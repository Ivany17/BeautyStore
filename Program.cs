var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles(); // Якщо хтось зайде на / - шукай index.html
app.UseStaticFiles();  // Віддавай будь-які файли з папки wwwroot

List<Product> products = new List<Product>
{
    new Product{Id = 1, Name = "Lipstick", Price = 100},
    new Product{Id = 2, Name = "Indian ink", Price = 200},
    new Product{Id = 3, Name =  "Foundation", Price = 300},
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
    }
    return change;
});


app.Run();

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public double Price { get; set; }
}

class ProductFromBody
{
    public string NameFromUser { get; set; } = "";
    public double PriceFromUser { get; set; }
}