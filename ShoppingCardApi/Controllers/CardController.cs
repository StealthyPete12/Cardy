using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

// CRUD operations for shopping/loyalty cards — all endpoints require authentication
[ApiController]
[Route("api/cards")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly CardyDbContext _db;
    public CardsController(CardyDbContext db) => _db = db;

    // Get the logged-in user's ID from the JWT token
    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/cards — return all cards belonging to the current user
    [HttpGet]
    public IActionResult GetCards() =>
        Ok(_db.Cards.Where(c => c.UserId == UserId).ToList());

    // Request body for creating a new card
    public record CardDto(string StoreName, string? CardNumber, string? Barcode,
                          string? BarcodeFormat, string? LogoUrl, string ColorHex);

    // POST /api/cards — add a new card to the user's wallet
    [HttpPost]
    public IActionResult AddCard(CardDto dto)
    {
        // If no barcode is provided, generate a random 12-digit one
        var barcode = string.IsNullOrWhiteSpace(dto.Barcode)
            ? GenerateBarcode()
            : dto.Barcode;

        var card = new Card
        {
            UserId = UserId,
            StoreName = dto.StoreName,
            CardNumber = string.IsNullOrWhiteSpace(dto.CardNumber) ? barcode : dto.CardNumber,
            Barcode = barcode,
            BarcodeFormat = string.IsNullOrWhiteSpace(dto.BarcodeFormat) ? "CODE128" : dto.BarcodeFormat,
            LogoUrl = dto.LogoUrl,
            ColorHex = dto.ColorHex
        };
        _db.Cards.Add(card);
        _db.SaveChanges();
        return Ok(card);
    }

    // Generate a random 12-digit barcode number
    private static string GenerateBarcode()
    {
        var rng = new Random();
        var digits = new char[12];
        for (int i = 0; i < 12; i++)
            digits[i] = (char)('0' + rng.Next(10));
        return new string(digits);
    }

    // DELETE /api/cards/{id} — remove a card (only if it belongs to the current user)
    [HttpDelete("{id}")]
    public IActionResult DeleteCard(int id)
    {
        var card = _db.Cards.FirstOrDefault(c => c.Id == id && c.UserId == UserId);
        if (card == null) return NotFound();
        _db.Cards.Remove(card);
        _db.SaveChanges();
        return NoContent();
    }
}