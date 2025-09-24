using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace WorkoutApi.Model;

[Table("refresh_token")]
public class RefreshToken : BaseModel
{
    [PrimaryKey("id")]
    public int Id { get; set; }

    [Column("refresh_token")]
    public string Token { get; set; } = string.Empty;

    [Column("jwt_id")]
    public string JwtId { get; set; } = string.Empty;

    [Column("is_revoked")]
    public bool IsRevoked { get; set; }

    [Column("time_added")]
    public DateTime TimeAdded { get; set; }

    [Column("expires_at")]
    public DateTime ExpiryTime { get; set; }

    // [Reference(typeof(DbUser))]
    // public DbUser User { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }
}
