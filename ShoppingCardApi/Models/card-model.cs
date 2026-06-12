public class Card
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string StoreName { get; set; } = "";
    public string Barcode { get; set; } = "";
    public string BarcodeFormat { get; set; } = "CODE128";
    public string? LogoUrl { get; set; }
    public string ColorHex { get; set; } = "#DCDCDC";
}