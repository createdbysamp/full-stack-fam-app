namespace WorkoutApi.ViewModels;

public class SavedWorkoutViewModel
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Exercise { get; set; } = string.Empty;
    public int UserId { get; set; }
}
