using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/cards")]
[Authorize]
public class CardsController : ControllerBase
{
    private readonly CardyDbContext _db;
    public CardsController(CardyDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirst("userId")!.Value);

    [HttpGet] // list my cards
    public IActionResult GetCards() =>
        Ok(_db.Cards.Where(c => c.UserId == UserId).ToList());

    public record CardDto(string StoreName, string Barcode,
                          string BarcodeFormat, string? LogoUrl, string ColorHex);

    [HttpPost]
    public IActionResult AddCard(CardDto dto)
    {
        var card = new Card
        {
            UserId = UserId,
            StoreName = dto.StoreName,
            Barcode = dto.Barcode,
            BarcodeFormat = dto.BarcodeFormat,
            LogoUrl = dto.LogoUrl,
            ColorHex = dto.ColorHex
        };
        _db.Cards.Add(card);
        _db.SaveChanges();
        return Ok(card);
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