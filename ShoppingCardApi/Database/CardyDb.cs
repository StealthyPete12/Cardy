using Microsoft.EntityFrameworkCore;

public class CardyDbContext : DbContext
{
    public CardyDbContext(DbContextOptions<CardyDbContext> options) : base(options) { }
    public DbSet<User> Users => Set<User>();
    public DbSet<Card> Cards => Set<Card>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Card>()
            .HasOne(c => c.User)
            .WithMany(u => u.Cards)
            .HasForeignKey(c => c.UserId);
    }
}