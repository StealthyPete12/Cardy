// Represents a loyalty/shopping card stored in a user's wallet
public class Card
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string StoreName { get; set; } = "";
    public string CardNumber { get; set; } = "";
    // The scannable barcode value displayed on the card
    public string Barcode { get; set; } = "";
    // Barcode type, e.g. "CODE128", "EAN-13"
    public string BarcodeFormat { get; set; } = "CODE128";
    public string? LogoUrl { get; set; }
    // Card theme color shown in the UI (hex format, e.g. "#D32F2F")
    public string ColorHex { get; set; } = "#DCDCDC";
}