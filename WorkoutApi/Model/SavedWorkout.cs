using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace WorkoutApi.Model;

[Table("saved_workouts")]
public class SavedWorkouts : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("content")]
    public string Content { get; set; } = string.Empty;
    
    [Reference(typeof(DbUser))]
    public DbUser User { get; set; }
}