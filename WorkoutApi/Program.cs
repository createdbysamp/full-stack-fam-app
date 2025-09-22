using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.JsonWebTokens;
using WorkoutApi.Services;
using Supabase;
using WorkoutApi.Model;
using Client = Supabase.Client;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddOpenApi();

builder.Services.AddSingleton<Client>(p =>
{
    var url = builder.Configuration["Supabase:Url"];
    var key = builder.Configuration["Supabase:Key"];
    
    if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
    {
        throw new Exception("Supabase:Url or Supabase:Key is required");
    }

    var options = new SupabaseOptions
    {
        AutoConnectRealtime = true
    };

    var supabase = new Client(url, key, options);
    supabase.InitializeAsync().Wait();
    return supabase;
});

builder.Services.AddIdentityCore<AppUser>()
    .AddUserStore<SupabaseUserStore>()
    .AddDefaultTokenProviders();

var tokenValidationParams = new TokenValidationParameters
{
    ValidateIssuerSigningKey = true,
    
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
    
    ValidateLifetime = false,
    
    ClockSkew = TimeSpan.Zero, // Access tokens by default has a lifetime of 5 minutes, and we need to override it here.
    
    ValidateIssuer = true, 
    ValidIssuer = builder.Configuration["Jwt:ValidIssuer"],
    ValidateAudience = true, 
    ValidAudience = builder.Configuration["Jwt:ValidAudience"],
};


builder.Services.AddSingleton(tokenValidationParams);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = tokenValidationParams;
    options.UseSecurityTokenValidators = true;
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();

app.UseAuthentication();
app.UseAuthorization();

app.Run();
