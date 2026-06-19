// Represents a registered user in the system
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    // Stored as a BCrypt hash — never store plain-text passwords
    public string PasswordHash { get; set; } = "";
    // All loyalty/shopping cards belonging to this user
    public List<Card> Cards { get; set; } = new();
}