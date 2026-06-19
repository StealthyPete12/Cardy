// Seeds the database with a default user and sample cards on first run
public static class DbInitializer
{
    public static void Seed(CardyDbContext db)
    {
        // Create a default user if one doesn't exist (replace with your own credentials)
        var user = db.Users.FirstOrDefault(u => u.Email == "Your own email");
        if (user == null)
        {
            user = new User
            {
                Email = "Your own email",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Your own password")
            };
            db.Users.Add(user);
            db.SaveChanges();
        }

        // Assign any unassigned cards to the default user
        var unassignedCards = db.Cards.Where(c => c.UserId != user.Id).ToList();
        foreach (var card in unassignedCards)
            card.UserId = user.Id;

        // Add sample loyalty cards if the user has none
        if (!db.Cards.Any(c => c.UserId == user.Id))
        {
            db.Cards.AddRange(
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Woolworths",
                    CardNumber = "WW-6001-0045-8823",
                    Barcode = "6001009048521",
                    BarcodeFormat = "EAN-13",
                    LogoUrl = "logo.dev",
                    ColorHex = "#1A1A1A"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Checkers",
                    CardNumber = "CK-8200-1137-5509",
                    Barcode = "6009182310274",
                    BarcodeFormat = "CODE128",
                    LogoUrl = "logo.dev",
                    ColorHex = "#D32F2F"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Shoprite",
                    CardNumber = "SR-7100-2284-6631",
                    Barcode = "6009501200348",
                    BarcodeFormat = "EAN-13",
                    LogoUrl = "logo.dev",
                    ColorHex = "#0D47A1"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "TFG",
                    CardNumber = "TFG-4400-7893-2210",
                    Barcode = "6005071501892",
                    BarcodeFormat = "CODE128",
                    LogoUrl = "logo.dev",
                    ColorHex = "#212121"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Pick n Pay",
                    CardNumber = "PNP-5500-3346-9917",
                    Barcode = "6001007082156",
                    BarcodeFormat = "EAN-13",
                    LogoUrl = "logo.dev",
                    ColorHex = "#1A3C8F"
                }
            );
        }

        db.SaveChanges();
    }
}
