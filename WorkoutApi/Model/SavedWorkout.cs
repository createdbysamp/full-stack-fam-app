using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace WorkoutApi.Model;

[Table("saved_workouts")]
public class SavedWorkout : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("exercise")]
    public string Exercise { get; set; } = string.Empty;

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("user_id")]
    public int UserId { get; set; }

    [Reference(typeof(DbUser))]
    public DbUser User { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
