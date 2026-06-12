using Microsoft.EntityFrameworkCore;

public class CardyDbContext : DbContext
{
    public CardyDbContext(DbContextOptions<CardyDbContext> options) : base(options) { }
    public DbSet<User> Users => Set<User>();
    public DbSet<Card> Cards => Set<Card>();
}