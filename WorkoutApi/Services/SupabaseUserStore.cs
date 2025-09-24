using Microsoft.AspNetCore.Identity;
using Supabase;
using WorkoutApi.Model;

namespace WorkoutApi.Services;

// Stores taking happy path only - work on error handling later
public class SupabaseUserStore : IUserPasswordStore<AppUser>
{
    private readonly Client _client;

    public SupabaseUserStore(Client client)
    {
        _client = client;
    }

    public void Dispose() { }

    public Task<string> GetUserIdAsync(AppUser user, CancellationToken cancellationToken)
    {
        return Task.FromResult(user.Id.ToString());
    }

    public Task<string?> GetUserNameAsync(AppUser user, CancellationToken cancellationToken)
    {
        return Task.FromResult(user.UserName);
    }

    public Task SetUserNameAsync(
        AppUser user,
        string? userName,
        CancellationToken cancellationToken
    )
    {
        if (userName == null)
            throw new ArgumentException("Username was missing in SetUserNameAsync");
        user.UserName = userName;
        return Task.CompletedTask;
    }

    public Task<string?> GetNormalizedUserNameAsync(
        AppUser user,
        CancellationToken cancellationToken
    )
    {
        return Task.FromResult(user.UserName.ToUpper());
    }

    public Task SetNormalizedUserNameAsync(
        AppUser user,
        string? normalizedName,
        CancellationToken cancellationToken
    )
    {
        if (normalizedName == null)
            throw new ArgumentException(
                $"normalizedName was null in {nameof(SetNormalizedUserNameAsync)}"
            );
        user.NormalizedUserName = normalizedName;
        return Task.CompletedTask;
    }

    public async Task<IdentityResult> CreateAsync(AppUser user, CancellationToken cancellationToken)
    {
        var dbUser = new DbUser
        {
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            Email = user.Email,
            PasswordHash = user.PasswordHash,
        };
        await _client.From<DbUser>().Insert(dbUser, null, cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> UpdateAsync(AppUser user, CancellationToken cancellationToken)
    {
        var userToUpdate = await _client
            .From<DbUser>()
            .Where(u => u.UserName == user.UserName)
            .Single(cancellationToken);

        if (userToUpdate == null)
            throw new ArgumentNullException(nameof(DbUser), "User not found");

        userToUpdate.UserName = user.UserName;
        userToUpdate.Email = user.Email;
        await userToUpdate.Update<DbUser>(cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<IdentityResult> DeleteAsync(AppUser user, CancellationToken cancellationToken)
    {
        var userFromDb = await _client
            .From<DbUser>()
            .Where(u => u.UserName == user.UserName)
            .Single(cancellationToken);
        if (userFromDb == null)
            return IdentityResult.Failed();
        await _client.From<DbUser>().Delete(userFromDb, null, cancellationToken);
        return IdentityResult.Success;
    }

    public async Task<AppUser?> FindByIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _client
            .From<DbUser>()
            .Where(u => u.Id.ToString() == userId)
            .Single(cancellationToken);

        var appUser = new AppUser
        {
            Id = user!.Id,
            UserName = user.UserName,
            Email = user.Email,
            PasswordHash = user.PasswordHash,
        };

        return appUser;
    }

    public async Task<AppUser?> FindByNameAsync(
        string normalizedUserName,
        CancellationToken cancellationToken
    )
    {
        var user = await _client
            .From<DbUser>()
            .Where(u => u.NormalizedUserName == normalizedUserName)
            .Single(cancellationToken);

        if (user == null)
            return null;

        var appUser = new AppUser
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            PasswordHash = user.PasswordHash,
        };
        return appUser;
    }

    public Task SetPasswordHashAsync(
        AppUser user,
        string? passwordHash,
        CancellationToken cancellationToken
    )
    {
        user.PasswordHash = passwordHash;
        return Task.CompletedTask;
    }

    public Task<string?> GetPasswordHashAsync(AppUser user, CancellationToken cancellationToken)
    {
        return Task.FromResult(user.PasswordHash);
    }

    public async Task<bool> HasPasswordAsync(AppUser user, CancellationToken cancellationToken)
    {
        return !string.IsNullOrEmpty(await GetPasswordHashAsync(user, cancellationToken));
    }
}
