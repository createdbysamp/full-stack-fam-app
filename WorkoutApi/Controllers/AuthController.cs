using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Supabase;
using WorkoutApi.Model;
using WorkoutApi.ViewModels;
using JwtRegisteredClaimNames = Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames;

namespace WorkoutApi.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly Client _client;
    private readonly IConfiguration _configuration;

    // Refresh Tokens
    private readonly TokenValidationParameters _tokenValidationParameters;

    public AuthController(
        UserManager<AppUser> userManager,
        Client client,
        IConfiguration config,
        TokenValidationParameters tokenValidationParameters
    )
    {
        _userManager = userManager;
        _client = client;
        _configuration = config;
        _tokenValidationParameters = tokenValidationParameters;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterViewModel vm)
    {
        // TODO: Validation in RegisterViewModel with attributes

        if (!ModelState.IsValid)
        {
            return BadRequest("Please provide All Required Fields");
        }

        var user = new AppUser
        {
            UserName = vm.UserName,
            NormalizedUserName = vm.UserName.ToUpper(),
            Email = vm.Email,
        };

        // Check if user exists
        var userExists = await _userManager.FindByNameAsync(vm.UserName);
        if (userExists != null)
        {
            return BadRequest("Username already exists");
        }

        // Else create it
        var result = await _userManager.CreateAsync(user, vm.Password);
        if (result.Succeeded)
        {
            return Ok("User Created");
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginViewModel vm)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest("Please provide All Required Fields");
        }
        var user = await _userManager.FindByNameAsync(vm.UserName);

        if (user != null && await _userManager.CheckPasswordAsync(user, vm.Password))
        {
            var tokenValue = await GenerateJwtTokenAsync(user, "", "");
            tokenValue.currentUserId = user.Id;
            return Ok(tokenValue);
        }

        return Unauthorized();
    }

    private async Task<AuthResultViewModel> GenerateJwtTokenAsync(
        AppUser user,
        string existingRefreshToken,
        string existingJti
    )
    {
        var jti = string.IsNullOrEmpty(existingJti) ? Guid.NewGuid().ToString() : existingJti;
        var authClaims = new Dictionary<string, object>
        {
            { JwtRegisteredClaimNames.Sub, user.Id.ToString() },
            { JwtRegisteredClaimNames.Jti, jti },
            { ClaimTypes.Name, user.UserName },
            { JwtRegisteredClaimNames.Email, user.Email },
        };

        var authSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );

        var token = new SecurityTokenDescriptor
        {
            Issuer = _configuration["Jwt:ValidIssuer"]!,
            Audience = _configuration["Jwt:ValidAudience"],
            Expires = DateTime.UtcNow.AddDays(7), // typically 5 - 10 mins
            Claims = authClaims,
            SigningCredentials = new SigningCredentials(
                authSigningKey,
                SecurityAlgorithms.HmacSha256
            ),
        };

        var jwtToken = new JsonWebTokenHandler().CreateToken(token);
        var refreshToken = new RefreshToken();

        if (string.IsNullOrEmpty(existingRefreshToken))
        {
            refreshToken = new RefreshToken
            {
                JwtId = jti,
                IsRevoked = false,
                Id = user.Id,
                TimeAdded = DateTime.UtcNow,
                ExpiryTime = DateTime.UtcNow.AddMonths(6), // 6-12 months is standard
                Token = Guid.NewGuid() + "-" + Guid.NewGuid(),
                UserId = user.Id,
            };
            await _client.From<RefreshToken>().Insert(refreshToken);
        }

        var response = new AuthResultViewModel
        {
            Token = jwtToken,
            RefreshToken = (
                string.IsNullOrEmpty(existingRefreshToken)
                    ? refreshToken.Token
                    : existingRefreshToken
            ),
            ExpiresAt = token.Expires ?? DateTime.Now, // TODO: Fix
        };

        return response;
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenViewModel vm)
    {
        try
        {
            var result = await VerifyAndGenerateTokenAsync(vm);
            if (result == null)
                return BadRequest("Invalid Token");
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    private async Task<AuthResultViewModel?> VerifyAndGenerateTokenAsync(RefreshTokenViewModel vm)
    {
        var jwtTokenHandler = new JsonWebTokenHandler();
        // validation
        // 1: Check JWT Token Format
        // Note: We do not care about validating the lifetime of the token here
        // If it's expired, we want to refresh it.
        var refreshValidationParameters = _tokenValidationParameters.Clone();
        refreshValidationParameters.ValidateLifetime = false;
        var tokenInVerification = await jwtTokenHandler.ValidateTokenAsync(
            vm.Token,
            refreshValidationParameters
        );

        JsonWebToken validatedToken;

        if (tokenInVerification.IsValid)
        {
            validatedToken = (JsonWebToken)tokenInVerification.SecurityToken;
        }
        else
        {
            throw new Exception(
                $"Token Failed to validate: {tokenInVerification.Exception.Message}"
            );
        }

        // 2: Check Encryption Algorithm
        if (validatedToken != null)
        {
            var result = validatedToken.Alg.Equals(
                SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase
            );

            if (!result)
                return null;
        }

        // 3: Check Expiry Date to see if expired
        var tokenExpiryDate = validatedToken!.Claims.FirstOrDefault(x =>
            x.Type == JwtRegisteredClaimNames.Exp
        );

        if (tokenExpiryDate == null)
            return null;
        var utcExpiryDate = long.Parse(tokenExpiryDate.Value);

        var expiryDate = UtcToDateTimeInUtc(utcExpiryDate);
        if (expiryDate > DateTime.UtcNow)
            throw new Exception("Token is not expired");

        // 4: Refresh token exists in the DB
        var dbRefreshToken = await _client
            .From<RefreshToken>()
            .Where(t => t.Token == vm.RefreshToken)
            .Single();

        if (dbRefreshToken == null)
            throw new Exception("Token is not in Database");

        // 5: Validate Id
        var jti = validatedToken
            .Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti)
            ?.Value;
        if (dbRefreshToken.JwtId != jti)
            throw new Exception("Token Does Not Match");

        // 6: Validate Refresh token is not expired
        if (dbRefreshToken.ExpiryTime <= DateTime.UtcNow)
            throw new Exception("Refresh Token has Expired. Please Reauthenticate");

        // 7: Validate if Revoked
        if (dbRefreshToken.IsRevoked)
            throw new Exception("Refresh Token is Revoked. Please Reauthenticate");

        // Generate new token (with existing refresh token)
        var dbUserData = await _client
            .From<DbUser>()
            .Where(u => u.Id == dbRefreshToken.UserId)
            .Single();

        if (dbUserData == null)
            throw new Exception("User for this token was not found");

        var appUserData = new AppUser
        {
            Id = dbUserData.Id,
            UserName = dbUserData.UserName,
            Email = dbUserData.Email,
        };

        return await GenerateJwtTokenAsync(appUserData, vm.RefreshToken, dbRefreshToken.JwtId);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(RefreshTokenViewModel vm)
    {
        await _client.From<RefreshToken>().Where(x => x.Token == vm.RefreshToken).Delete();
        return Ok("Successfully Logged out");
    }

    private DateTime UtcToDateTimeInUtc(long timestamp)
    {
        var dateTimeValue = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        return dateTimeValue.AddSeconds(timestamp);
    }
}
