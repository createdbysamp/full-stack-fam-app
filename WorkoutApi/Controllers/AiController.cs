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

    // generate sql query

    // [HttpGet("test")]
    // public async Task<IActionResult> GenerateSqlQuery(string question, string full_table_name)
    // {
    //     var prompt =
    //         $"Generate only 1 SQL query based on these parameters: {question}. The table to use is {full_table_name}. The columns you will use are 'category', 'type', 'subtype', & 'subtype_two'. Use only the columns needed to answer the question, not all of the available columns. Limit data as much as possible, and follow strictly Postgres syntax."
    //         + $"Always output plain SQL only, no extra text or explanation"
    //         + $"The value of sqlQuery must be plain SQL only, no formatting or code fences.";
    //     var response = await _googleAi.GenerateContentAsync(prompt);
    //     // Console.WriteLine($"raw RESPONSE: {response}");

    //     // clean SQL response
    //     var cleanSql = ExtractCleanSql(response);
    //     // Console.WriteLine($"clean RESPONSE: {cleanSql}");

    //     return Ok(
    //         new
    //         {
    //             Question = question,
    //             TableName = full_table_name,
    //             SqlQuery = cleanSql,
    //             RawResponse = response, // for debugging
    //         }
    //     );
    // }

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

    [HttpGet("complete-workflow")]
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
                + "{ \"title\": \"workout name\", "
                + "\"exercises\": [ "
                + "{ \"name\": \"exercise name\", \"sets\": \"number\", \"reps\": \"number\", \"description\": \"from dataset\", \"instructions\": \"brief form cues\" } "
                + "] }. "
                + "Do not wrap the response in markdown, code fences, or quotes. Output pure JSON only.";
            var workout = await _googleAi.GenerateContentAsync(workoutPrompt);
            var jsonWorkout = CleanJsonResponse(workout);

            return Ok(
                new
                {
                    UserInput = userInput,
                    GeneratedSQL = cleanSql,
                    ExerciseData = exerciseData,
                    // RawWorkout = workout,
                    WorkoutPlan = jsonWorkout,
                    Pipeline = "User Input → Agent0 (SQL) → PostgreSQL → Agent2 (Workout Generation)!!",
                }
            );
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    // private async Task<string> ExecuteViaRestApi(string sqlQuery)
    // {
    //     using var httpClient = new HttpClient();
    //     httpClient.Timeout = TimeSpan.FromSeconds(30);
    //     httpClient.DefaultRequestHeaders.Add("apikey", _configuration["Supabase:Key"]);

    //     // Simple mapping of user input to REST API filters
    //     var filters = new List<string>();
    //     var input = sqlQuery.ToLower();

    //     // category
    //     if (input.Contains("strength"))
    //         filters.Add("category=eq.Strength");
    //     if (input.Contains("calisthenics"))
    //         filters.Add("category=eq.Calisthenics");
    //     if (input.Contains("mindfulness"))
    //         filters.Add("category=eq.Mindfulness");

    //     // level
    //     if (input.Contains("beginner"))
    //         filters.Add("level=ilike.*Beginner*");
    //     if (input.Contains("intermediate"))
    //         filters.Add("level=ilike.*Intermediate*");
    //     if (input.Contains("advanced"))
    //         filters.Add("level=ilike.*Advanced*");

    //     // type/subtype
    //     if (input.Contains("tai chi") || input.Contains("tai"))
    //         filters.Add("type=ilike.*Tai*");
    //     if (input.Contains("chest"))
    //         filters.Add("type=ilike.*Chest*");
    //     if (input.Contains("legs") || input.Contains("leg"))
    //         filters.Add("type=ilike.*Leg*,type=ilike.*Quad*");
    //     if (input.Contains("core"))
    //         filters.Add("type=eq.Core");

    //     // equpiment
    //     if (input.Contains("bodyweight"))
    //         filters.Add("subtype_two=ilike.*Bodyweight*");
    //     if (input.Contains("machine"))
    //         filters.Add("subtype_two=ilike.*Machine*");
    //     if (input.Contains("dumbbell"))
    //         filters.Add("subtype_two=ilike.*Dumbbell*");

    //     // combining filters
    //     var filterString = filters.Count > 0 ? "&" + string.Join("&", filters) : "";

    //     // Default to returning some exercises if no specific filters match
    //     var limit = filters.Count > 0 ? 8 : 5;

    //     var url =
    //         $"{_configuration["Supabase:Url"]}/rest/v1/exercises?select=*{filterString}&limit={limit}";
    //     var response = await httpClient.GetAsync(url);
    //     return await response.Content.ReadAsStringAsync();
    // }

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

    // [HttpGet("debug-connection")]
    // public IActionResult DebugConnection()
    // {
    //     try
    //     {
    //         var connectionString = _configuration["Supabase:DatabaseUrl"];
    //         return Ok(
    //             new
    //             {
    //                 ConnectionString = connectionString,
    //                 Length = connectionString?.Length ?? 0,
    //                 IsNull = connectionString == null,
    //             }
    //         );
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { Error = ex.Message });
    //     }
    // }

    // [HttpGet("test-rest-strength")]
    // public async Task<IActionResult> TestRestStrength()
    // {
    //     try
    //     {
    //         using var httpClient = new HttpClient();
    //         httpClient.Timeout = TimeSpan.FromSeconds(30); // Longer timeout like PostgreSQL
    //         httpClient.DefaultRequestHeaders.Add("apikey", _configuration["Supabase:Key"]);
    //         httpClient.DefaultRequestHeaders.Add(
    //             "Authorization",
    //             $"Bearer {_configuration["Supabase:Key"]}"
    //         );

    //         var response = await httpClient.GetAsync(
    //             $"{_configuration["Supabase:Url"]}/rest/v1/exercises?select=name,category&category=eq.Strength&limit=2"
    //         );
    //         var content = await response.Content.ReadAsStringAsync();

    //         return Ok(
    //             new
    //             {
    //                 Query = "Strength exercises via REST API",
    //                 StatusCode = response.StatusCode,
    //                 Content = content,
    //                 ResponseTime = "Will show in network tab",
    //             }
    //         );
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { Error = ex.Message, Type = ex.GetType().Name });
    //     }
    // }
    // http://localhost:5073

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
