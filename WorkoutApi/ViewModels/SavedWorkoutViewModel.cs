namespace WorkoutApi.ViewModels;

public class SavedWorkoutViewModel
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int UserId { get; set; }
}
