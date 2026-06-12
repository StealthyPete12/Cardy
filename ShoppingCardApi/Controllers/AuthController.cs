using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly CardyDbContext _db;
    private readonly IConfiguration _config;
    public AuthController(CardyDbContext db, IConfiguration config)
        { _db = db; _config = config; }

    public record AuthDto(string Email, string Password);

    [HttpPost("register")]
    public IActionResult Register(AuthDto dto)
    {
        if (_db.Users.Any(u => u.Email == dto.Email))
            return BadRequest("Email already in use");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };
        _db.Users.Add(user);
        _db.SaveChanges();
        return Ok(new { token = CreateToken(user) });
    }

    [HttpPost("login")]
    public IActionResult Login(AuthDto dto)
    {
        var user = _db.Users.FirstOrDefault(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");
        return Ok(new { token = CreateToken(user) });
    }

    private string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            claims: new[] { new Claim("userId", user.Id.ToString()) },
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}