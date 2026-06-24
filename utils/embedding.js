const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generates a vector embedding for a given text string.
 * Uses the embedding-001 model.
 */
async function generateEmbedding(text) {
  try {
    const hasValidKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0;
    if (!hasValidKey) {
        console.log("No valid Gemini API key found. Returning dummy embedding.");
        // Return dummy array of 768 zeros if no API key is available so app doesn't crash locally
        return Array(768).fill(0);
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the embedding model
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return dummy array on error to prevent crashes during fallback
    return Array(768).fill(0);
  }
}

/**
 * Calculates the cosine similarity between two vectors.
 * Returns a score between -1 and 1, where 1 means identical.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return -1;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateEmbedding,
  cosineSimilarity
};
