using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using Supabase.Postgrest;
using WorkoutApi.Model;
using WorkoutApi.ViewModels;
using Client = Supabase.Client;

namespace WorkoutApi.Controllers;

[ApiController]
[Route("workouts")]
public class WorkoutController : ControllerBase
{
    
    private readonly Client _client;

    public WorkoutController(Client client)
    {
        _client = client;
    }
    
    // All workouts
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<SavedWorkout>>> GetUserWorkouts()
    {
        // Get Current User ID
        var currentUserId = User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null) return BadRequest("Username not found in authentication");
        
        // Get workouts based on User Id
        var workouts = await _client
            .From<SavedWorkout>()
            .Select("id, content, user:users(id)")
            .Filter("user_id", Constants.Operator.Equals, currentUserId)
            .Get();

        // if none found return 404
        if (workouts.Models.Count == 0) return NotFound();
        
        // Transform in to view model
        var vm = new AllSavedWorkoutsViewModel();
        foreach (var workout in workouts.Models)
        {
            var w = new SavedWorkoutViewModel
            {
                Id = workout.Id,
                Content = workout.Content,
                UserId =  workout.User.Id,
            };
            vm.Workouts.Add(w);
        }
        
        return Ok(vm);
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreateWorkout(SavedWorkoutViewModel vm)
    {
        var currentUserId = User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null) return BadRequest("User name not found in authentication");

        var user = await _client.From<DbUser>().Filter(u => u.Id.ToString(), Constants.Operator.Equals, currentUserId).Single();
        if (user == null) return BadRequest();
        
        // No specific authorization
        var savedWorkout = new SavedWorkout
        {
            Content = vm.Content,
            UserId = Int32.Parse(currentUserId)
        };

        await _client.From<SavedWorkout>().Insert(savedWorkout);
        
        return Ok();

    }
    
    [HttpGet("{workoutId:int}")]
    [Authorize]
    public async Task<ActionResult<SavedWorkout>> GetWorkout(int workoutId)
    {
        
        var currentUserId = User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null) return BadRequest("User name not found in authentication");
        
        var workout = await _client
            .From<SavedWorkout>()
            .Select("id, content, user:users(id)")
            .Filter("id", Constants.Operator.Equals, workoutId)
            .Single();
        
        if (workout == null) return NotFound();

        if (currentUserId != workout.User.Id.ToString()) return Unauthorized("User ID does not match workout User ID");

        var vm = new SavedWorkoutViewModel
        {
            UserId = workout.User.Id,
            Content = workout.Content,
            Id = workout.Id
        };
        return Ok(vm);
    }

    [HttpPost("edit/{workoutId:int}")]
    [Authorize]
    public async Task<ActionResult<SavedWorkoutViewModel>> EditWorkout(int workoutId, SavedWorkoutViewModel vm)
    {
        // Authentication
        var currentUserId = User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null) return BadRequest("User name not found in authentication");
        
        // Check existing
        var existing = await _client.From<SavedWorkout>().Where(w => w.Id == workoutId).Single();
        if (existing == null) return NotFound();
        // Authorization
        if (existing.User.Id.ToString() != currentUserId) return Unauthorized("User not allowed to do this action");
        
        // Update
        existing.Content = vm.Content;
        
        // Save
        await existing.Update<SavedWorkout>();
        return Ok(vm);
    }
    
    // delete workout
    [HttpPost("delete/{workoutId:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteWorkout(int workoutId)
    {
        
        var currentUserId = User.FindFirst(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null) return BadRequest("User name not found in authentication");
        
        var existing = await _client.From<SavedWorkout>().Where(w => w.Id == workoutId).Single();
        if (existing == null) return NotFound();
        // Authorization
        if (existing.User.Id.ToString() != currentUserId) return Unauthorized("User not allowed to do this action");
        
        await _client
            .From<SavedWorkout>()
            .Where(w => w.Id == workoutId)
            .Delete();
        
        return Ok();
    }
}