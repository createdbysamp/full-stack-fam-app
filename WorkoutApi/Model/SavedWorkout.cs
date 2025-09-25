using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace WorkoutApi.Model;

[Table("saved_workouts")]
public class SavedWorkout : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("exercise")]
    public string Exercises { get; set; } = string.Empty;

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("instructions")]
    public string Instructions { get; set; } = string.Empty;

    [Column("user_id")]
    public int UserId { get; set; }

    [Reference(typeof(DbUser))]
    public DbUser User { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
