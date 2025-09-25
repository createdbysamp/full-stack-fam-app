using System.Diagnostics;
using GenerativeAI;
using Microsoft.AspNetCore.Mvc;
using Supabase;
using WorkoutApi.Model;
using WorkoutApi.Services;
using WorkoutApi.ViewModels;

namespace WorkoutApi.Controllers;

[ApiController]
[Route("ai")]
public class AiController : ControllerBase
{
    private readonly GoogleAIService _googleAi;
    private readonly Client _supabase;
    private readonly IConfiguration _configuration;

    // constructor to create googleAiService
    public AiController(GoogleAIService googleAI, Client supabase, IConfiguration configuration)
    {
        _googleAi = googleAI;
        _supabase = supabase;
        _configuration = configuration;
    }

    // execute query helper method
    // Execute SQL using direct PostgreSQL connection
    private async Task<List<Dictionary<string, object>>> ExecuteSqlWithConnectionString(
        string sqlQuery
    )
    {
        var connectionString = BuildConnectionString();
        var maxRetries = 3;
        var baseDelay = 10;
        for (int attempt = 0; attempt < maxRetries; attempt++)
        { // Get your Supabase connection string from configuration
            try
            {
                var results = new List<Dictionary<string, object>>();

                using var connection = new Npgsql.NpgsqlConnection(connectionString);
                await connection.OpenAsync();

                using var command = new Npgsql.NpgsqlCommand(sqlQuery, connection);
                command.CommandTimeout = 10;
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    var row = new Dictionary<string, object>();
                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        var columnName = reader.GetName(i);
                        var value = reader.GetValue(i);
                        row[columnName] = value ?? DBNull.Value;
                    }
                    results.Add(row);
                }
                return results;
            }
            catch (Exception ex) when (attempt < maxRetries - 1)
            {
                var delay = baseDelay * (int)Math.Pow(2, attempt); // exponential backoff if servers actin' weird
                Console.WriteLine(
                    $"SQL attempt {attempt + 1} failed: {ex.Message}. Retrying in {delay}ms..."
                );
                await Task.Delay(delay);
            }
        }
        // if it fails - ahhh send info
        throw new Exception($"SQL execution failed after {maxRetries} attempts");
    }

    // Build PostgreSQL connection string from Supabase config
    private string BuildConnectionString()
    {
        var uri = _configuration["Supabase:DatabaseUrl"]!;

        // Parse the PostgreSQL URI and convert to URI format
        var parsedUri = new Uri(uri);

        var host = parsedUri.Host;
        var port = parsedUri.Port;
        var database = parsedUri.LocalPath.TrimStart('/');
        var userInfo = parsedUri.UserInfo.Split(':');
        var username = userInfo[0];
        var password = Uri.UnescapeDataString(userInfo[1]); // This will decode %21 back to !

        return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchExercises(string sqlQuery)
    {
        try
        {
            var results = await ExecuteSqlWithConnectionString(sqlQuery);

            return Ok(new { Results = results, ResultCount = results?.Count ?? 0 });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("workout")]
    public async Task<IActionResult> CompleteWorkflow(string userInput)
    {
        try
        {
            // Agent 0 Generate SQL from user input
            var sqlPrompt =
                $"Generate only 1 SQL query based on these parameters: {userInput}. "
                + "The table is 'exercises'. "
                + "Data structure: 'category' contains broad types (Strength, Calisthenics, Mindfulness), "
                + "'type' contains body parts/muscles (Chest, Core, Quads), "
                + "'subtype' contains exercise styles, 'subtype_two' contains equipment. "
                + "For body part requests like 'chest exercises', search the 'type' column, not 'category'. "
                + "Use ILIKE for partial matching. "
                + "Select minimal columns needed."
                + "Always SELECT: name & description."
                + "Output plain SQL only, no formatting.";
            var generatedSql = await _googleAi.GenerateContentAsync(sqlPrompt);
            var cleanSql = ExtractCleanSql(generatedSql);

            // Convert SQL to REST API call and execute
            // var exerciseData = await ExecuteViaRestApi(cleanSql);
            var sqlResults = await ExecuteSqlWithConnectionString(cleanSql);
            var exerciseData = System.Text.Json.JsonSerializer.Serialize(sqlResults);

            // AGENT 2!!! generating workout from results
            // var workoutPrompt =
            //     $"Create a workout routine using these exercises: {exerciseData}."
            //     + $"Have it match the user's workout goals based on their input: {userInput}."
            //     + "Only include information found in the dataset."
            //     + $"Do not add extra text at the beginning before the exercises."
            //     + $"Format the data as Markdown.";
            // var workout = await _googleAi.GenerateContentAsync(workoutPrompt);
            // JSON VERSION
            var workoutPrompt =
                $"Create a workout routine using these exercises: {exerciseData}. "
                + $"Match the user's workout goals: {userInput}. "
                + "Only include information found in the dataset. "
                + "Return the response as raw JSON object with this exact structure: "
                + "Create the instructions category on your own. "
                + "{ \"title\": \"workout name\", "
                + "\"exercises\": [ "
                + "{ \"name\": \"exercise name\", \"sets\": \"number\", \"reps\": \"number\", \"description\": \"from dataset\", \"instructions\": \"brief form cues\" } "
                + "] }. "
                + "Do not wrap the response in markdown, code fences, or quotes. Output pure JSON only.";
            var workout = await _googleAi.GenerateContentAsync(workoutPrompt);
            var jsonWorkout = CleanJsonResponse(workout);

            return Ok(
                // UserInput = userInput,
                // GeneratedSQL = cleanSql,
                // ExerciseData = exerciseData,
                // RawWorkout = workout,
                jsonWorkout
            // Pipeline = "User Input → Agent0 (SQL) → PostgreSQL → Agent2 (Workout Generation)!!",

            );
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    // helper method
    private string ExtractCleanSql(string response)
    {
        if (string.IsNullOrWhiteSpace(response))
        {
            return string.Empty;
        }
        // trims newlines & whitespace
        var cleanedResponse = response.Trim();
        return cleanedResponse;
    }

    private string CleanJsonResponse(string response)
    {
        if (string.IsNullOrWhiteSpace(response))
            return response;

        // Remove ```json at the beginning and ``` at the end
        var cleaned = response.Trim();

        if (cleaned.StartsWith("```json"))
            cleaned = cleaned.Substring(7); // Remove ```json
        else if (cleaned.StartsWith("```"))
            cleaned = cleaned.Substring(3); // Remove ```

        if (cleaned.EndsWith("```"))
            cleaned = cleaned.Substring(0, cleaned.Length - 3); // Remove trailing ```

        return cleaned.Trim();
    }

    [HttpGet("test-postgres-categories")]
    public async Task<IActionResult> TestPostgresCategories()
    {
        try
        {
            var results = await ExecuteSqlWithConnectionString(
                "SELECT category, COUNT(*) as count FROM exercises GROUP BY category ORDER BY count DESC"
            );
            return Ok(new { Message = "Category breakdown successful", Results = results });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Category query failed", Details = ex.Message });
        }
    }
}
