using Supabase.Postgrest.Attributes;

namespace WorkoutApi.Model;

public class CurrentWorkouts
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("content")]
    public string Content { get; set; } = string.Empty;
    
    [Column("date")]
    public DateTime Date { get; set; } = DateTime.Now;
    
    [Column("user_id")]
    public int UserId { get; set; }
}
