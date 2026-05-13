const {
  createQueryText,
  calculateSkillsSimilarity,
  calculateEducationSimilarity,
  calculateBackgroundSimilarity,
  calculateEconomicSimilarity,
  findMatchedSkills,
  generateExplanation,
} = require('./similarityEngine');

/**
 * Career recommendation algorithm
 * Uses skills, education, background and economic similarity only
 */
async function recommendCareersPaths(userInput, careerPaths) {
  try {
    // Create query text from user input
    const queryText = createQueryText(userInput);
    console.log(`Query text: "${queryText}"`);

    // Score all career paths
    const scoredCareers = [];

    for (const career of careerPaths) {
      try {
        // 1. Skills Similarity
        const skillsSimilarity = await calculateSkillsSimilarity(
          userInput.skills || [],
          career.submitterSkills || []
        );

        // 2. Education Similarity
        const educationSimilarity = await calculateEducationSimilarity(
          userInput.education,
          career.submitterEducationHistory
        );

        // 3. Background Similarity
        const backgroundSimilarity = calculateBackgroundSimilarity(
          userInput.background,
          career.submitterBackground
        );

        // 4. Economic Similarity
        const economicSimilarity = calculateEconomicSimilarity(
          userInput.economicStatus,
          career.submitterEconomicStatus
        );

        // Calculate final score
        const finalScore =
          0.60 * skillsSimilarity +
          0.30 * educationSimilarity +
          0.05 * backgroundSimilarity +
          0.05 * economicSimilarity;

        // Find matched skills
        const matchedSkills = findMatchedSkills(
          userInput.skills || [],
          career.submitterSkills || []
        );

        // Generate explanation
        const explanation = generateExplanation(
          0,
          skillsSimilarity,
          educationSimilarity,
          backgroundSimilarity,
          economicSimilarity,
          matchedSkills
        );

        scoredCareers.push({
          _id: career._id,
          title: career.title,
          category: career.category,
          description: career.description,
          stages: career.stages || [],
          transitions: career.transitions || [],
          finalScore: parseFloat(finalScore.toFixed(4)),
          skillsSimilarity: parseFloat(skillsSimilarity.toFixed(4)),
          educationSimilarity: parseFloat(educationSimilarity.toFixed(4)),
          backgroundSimilarity: parseFloat(backgroundSimilarity.toFixed(4)),
          economicSimilarity: parseFloat(economicSimilarity.toFixed(4)),
          matchedSkills: matchedSkills,
          explanation: explanation,
          submitterBackground: career.submitterBackground,
          submitterEconomicStatus: career.submitterEconomicStatus,
        });
      } catch (error) {
        console.error(`Error scoring ${career.title}:`, error.message);
      }
    }

    // Sort by final score descending
    scoredCareers.sort((a, b) => b.finalScore - a.finalScore);

    // Return top 5
    const topResults = scoredCareers.slice(0, 5);

    return {
      success: true,
      count: topResults.length,
      results: topResults,
      message: `Found ${topResults.length} matching career paths`,
    };
  } catch (error) {
    console.error('Recommendation error:', error.message);
    return {
      success: false,
      error: error.message,
      results: [],
    };
  }
}

module.exports = {
  recommendCareersPaths,
};
