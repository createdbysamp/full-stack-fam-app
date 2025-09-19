namespace WorkoutApi.Model;

// You can also inherit from IdentityUser here
public class AppUser 
{
    public int Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string NormalizedUserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
}