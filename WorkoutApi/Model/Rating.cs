using Supabase.Postgrest.Attributes;

namespace WorkoutApi.Model;

public class Rating
{
    [PrimaryKey("id")]
    public int Id { get; set; }
    [Column("rating")]
    public int RatingVaue { get; set; }
    
    [Column("workout_id")]
    public int WorkoutId { get; set; }
    
    [Column("user_id")]
    public int UserId { get; set; }
}