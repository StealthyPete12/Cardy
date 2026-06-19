using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/cards")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly CardyDbContext _db;
    public CardsController(CardyDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet] // list my cards
    public IActionResult GetCards() =>
        Ok(_db.Cards.Where(c => c.UserId == UserId).ToList());

    public record CardDto(string StoreName, string? CardNumber, string? Barcode,
                          string? BarcodeFormat, string? LogoUrl, string ColorHex);

    [HttpPost]
    public IActionResult AddCard(CardDto dto)
    {
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

    private static string GenerateBarcode()
    {
        var rng = new Random();
        var digits = new char[12];
        for (int i = 0; i < 12; i++)
            digits[i] = (char)('0' + rng.Next(10));
        return new string(digits);
    }

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