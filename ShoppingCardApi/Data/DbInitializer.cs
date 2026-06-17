public static class DbInitializer
{
    public static void Seed(CardyDbContext db)
    {
        var user = db.Users.FirstOrDefault(u => u.Email == "TimTest@testing.com");
        if (user == null)
        {
            user = new User
            {
                Email = "TimTest@testing.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123")
            };
            db.Users.Add(user);
            db.SaveChanges();
        }

        var unassignedCards = db.Cards.Where(c => c.UserId != user.Id).ToList();
        foreach (var card in unassignedCards)
            card.UserId = user.Id;

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
                    LogoUrl = "https://logo.clearbit.com/woolworths.co.za",
                    ColorHex = "#1A1A1A"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Checkers",
                    CardNumber = "CK-8200-1137-5509",
                    Barcode = "6009182310274",
                    BarcodeFormat = "CODE128",
                    LogoUrl = "https://logo.clearbit.com/checkers.co.za",
                    ColorHex = "#D32F2F"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Shoprite",
                    CardNumber = "SR-7100-2284-6631",
                    Barcode = "6009501200348",
                    BarcodeFormat = "EAN-13",
                    LogoUrl = "https://logo.clearbit.com/shoprite.co.za",
                    ColorHex = "#0D47A1"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "TFG",
                    CardNumber = "TFG-4400-7893-2210",
                    Barcode = "6005071501892",
                    BarcodeFormat = "CODE128",
                    LogoUrl = "https://logo.clearbit.com/tfg.co.za",
                    ColorHex = "#212121"
                },
                new Card
                {
                    UserId = user.Id,
                    StoreName = "Pick n Pay",
                    CardNumber = "PNP-5500-3346-9917",
                    Barcode = "6001007082156",
                    BarcodeFormat = "EAN-13",
                    LogoUrl = "https://logo.clearbit.com/pnp.co.za",
                    ColorHex = "#1A3C8F"
                }
            );
        }

        db.SaveChanges();
    }
}
