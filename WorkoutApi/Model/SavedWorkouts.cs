using Supabase.Postgrest.Attributes;

namespace WorkoutApi.Model;

public class SavedWorkouts
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("content")]
    public string Content { get; set; } = string.Empty;
    
    [Column("user_id")]
    public int UserId { get; set; }
}