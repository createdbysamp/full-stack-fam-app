using GenerativeAI;

namespace WorkoutApi.Services
{
    public class GoogleAIService
    {
        private readonly GoogleAi _googleAI;

        public GoogleAIService(IConfiguration configuration)
        {
            var apiKey = configuration["GoogleAI:ApiKey"];
            if (!apiKey.Trim().Any())
            {
                throw new InvalidOperationException(
                    "Google AI API KEY not configured in user secrets."
                );
            }
            // API key is "synced with robot" when service is created
            _googleAI = new GoogleAi(apiKey);
        }

        public async Task<string> GenerateContentAsync(string prompt)
        {
            var model = _googleAI.CreateGenerativeModel("models/gemini-2.5-flash");
            var response = await model.GenerateContentAsync(prompt);
            return response.Text();
        }
    }
}
