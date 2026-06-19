using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Use SQLite as the database — stores data in a local file called Cardy.db
builder.Services.AddDbContext<CardyDbContext>(o => o.UseSqlite("Data Source=Cardy.db"));

// Set up JWT authentication so users can securely log in
var jwtKey = builder.Configuration["Jwt:Key"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.MapInboundClaims = true;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddControllers();
var app = builder.Build();

// Middleware order matters: authenticate first, then check authorization
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Create the database tables if they don't exist and seed with sample data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CardyDbContext>();
    db.Database.EnsureCreated();
    DbInitializer.Seed(db);
}

app.Run();