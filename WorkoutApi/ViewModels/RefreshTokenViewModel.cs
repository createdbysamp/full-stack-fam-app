using System.ComponentModel.DataAnnotations;

namespace WorkoutApi.ViewModels;

public class RefreshTokenViewModel
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
