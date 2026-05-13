const { pipeline, env } = require('@xenova/transformers');

// Set cache directory
env.cacheDir = './model_cache';

let embeddingPipeline = null;

/**
 * Initialize the embedding model (lazy loading)
 */
async function initializeModel() {
  if (!embeddingPipeline) {
    console.log('Loading sentence-transformers model...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✓ Embedding model loaded successfully');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for text using all-MiniLM-L6-v2
 */
async function generateEmbedding(text) {
  try {
    const model = await initializeModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Create query text from user search inputs
 */
function createQueryText(userInput) {
  const parts = [
    userInput.education || '',
    (userInput.skills || []).join(' '),
    userInput.background || '',
    userInput.economicStatus || '',
  ];

  return parts.filter(p => p).join(' ').toLowerCase();
}

/**
 * Calculate skills similarity using semantic matching
 */
async function calculateSkillsSimilarity(userSkills, careerSkills) {
  if (!userSkills || userSkills.length === 0 || !careerSkills || careerSkills.length === 0) {
    return 0.5; // neutral score if no skills provided
  }

  try {
    const model = await initializeModel();
    let totalSimilarity = 0;
    let matches = 0;

    // For each user skill, find best match in career skills
    for (const userSkill of userSkills) {
      const userSkillText = userSkill.toLowerCase();
      const userEmbedding = await generateEmbedding(userSkillText);

      let bestMatch = 0;
      for (const careerSkill of careerSkills) {
        const careerSkillText = careerSkill.toLowerCase();
        const careerEmbedding = await generateEmbedding(careerSkillText);
        const similarity = cosineSimilarity(userEmbedding, careerEmbedding);
        bestMatch = Math.max(bestMatch, similarity);
      }

      totalSimilarity += bestMatch;
      matches++;
    }

    return matches > 0 ? totalSimilarity / matches : 0;
  } catch (error) {
    console.error('Error calculating skills similarity:', error.message);
    return 0.5;
  }
}

/**
 * Calculate education similarity using semantic embeddings.
 */
async function calculateEducationSimilarity(userEducation, careerEducationHistory) {
  if (!userEducation || !careerEducationHistory) {
    return 0.5; // neutral if not provided
  }

  try {
    const userEmbedding = await generateEmbedding(userEducation.toLowerCase());
    const careerEmbedding = await generateEmbedding(careerEducationHistory.toLowerCase());
    return cosineSimilarity(userEmbedding, careerEmbedding);
  } catch (error) {
    console.error('Error calculating education similarity:', error.message);
    return 0.5;
  }
}

/**
 * Calculate background similarity
 */
function calculateBackgroundSimilarity(userBackground, careerBackground) {
  if (!userBackground || !careerBackground) {
    return 0.5; // neutral
  }

  const userBg = userBackground.toLowerCase();
  const careerBg = careerBackground.toLowerCase();

  if (userBg === careerBg) {
    return 1.0; // perfect match
  }

  // Semi-urban and urban are somewhat similar
  const urbanTypes = ['urban', 'semi-urban'];
  const ruralTypes = ['rural', 'tribal'];

  const userIsUrban = urbanTypes.some(t => userBg.includes(t));
  const careerIsUrban = urbanTypes.some(t => careerBg.includes(t));
  const userIsRural = ruralTypes.some(t => userBg.includes(t));
  const careerIsRural = ruralTypes.some(t => careerBg.includes(t));

  if ((userIsUrban && careerIsUrban) || (userIsRural && careerIsRural)) {
    return 0.8;
  }

  if ((userIsUrban && careerIsRural) || (userIsRural && careerIsUrban)) {
    return 0.4;
  }

  return 0.5;
}

/**
 * Calculate economic similarity
 */
function calculateEconomicSimilarity(userEconomic, careerEconomic) {
  if (!userEconomic || !careerEconomic) {
    return 0.5; // neutral
  }

  const userEc = userEconomic.toLowerCase();
  const careerEc = careerEconomic.toLowerCase();

  if (userEc === careerEc) {
    return 1.0; // perfect match
  }

  // Poor and Middle are somewhat similar
  // Middle and Rich are somewhat similar
  const economicDistance = {
    'poor-middle': 0.6,
    'middle-rich': 0.6,
    'poor-rich': 0.2,
  };

  const key = [userEc, careerEc].sort().join('-');
  return economicDistance[key] || 0.3;
}

/**
 * Find best matching skills between user and career
 */
function findMatchedSkills(userSkills, careerSkills) {
  if (!userSkills || !careerSkills) return [];

  const matched = [];
  const userSkillsLower = userSkills.map(s => s.toLowerCase());

  for (const careerSkill of careerSkills) {
    const careerSkillLower = careerSkill.toLowerCase();
    
    // Check for exact or near match
    if (userSkillsLower.some(us => 
      us.includes(careerSkillLower) || careerSkillLower.includes(us)
    )) {
      matched.push(careerSkill);
    }
  }

  return matched;
}

/**
 * Generate explanation for recommendation
 */
function generateExplanation(semanticSim, skillsSim, eduSim, bgSim, ecSim, matchedSkills) {
  const explanations = [];

  if (semanticSim > 0.7) {
    explanations.push('Strong semantic match with your career interests and background');
  } else if (semanticSim > 0.5) {
    explanations.push('Good semantic alignment with your search query');
  }

  if (matchedSkills.length > 0) {
    explanations.push(`Matched skills: ${matchedSkills.slice(0, 3).join(', ')}`);
  }

  if (skillsSim > 0.7) {
    explanations.push('Your skills closely match career requirements');
  } else if (skillsSim > 0.5) {
    explanations.push('Some skill alignment with this career path');
  }

  if (eduSim > 0.7) {
    explanations.push('Educational background aligns well with this career');
  }

  if (bgSim > 0.7 && ecSim > 0.7) {
    explanations.push('Personal background and economic status are similar to successful practitioners');
  }

  return explanations;
}

module.exports = {
  initializeModel,
  generateEmbedding,
  cosineSimilarity,
  createQueryText,
  calculateSkillsSimilarity,
  calculateEducationSimilarity,
  calculateBackgroundSimilarity,
  calculateEconomicSimilarity,
  findMatchedSkills,
  generateExplanation,
};
