
import { GoogleGenAI } from "@google/genai";
import { ImageFile, PoseType, AspectRatio } from "../types";

// Helper to strip the prefix from base64 strings if present
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:(.*,)?/, '');
};

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries an async operation with exponential backoff if a rate limit error occurs.
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 2000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isRateLimit = 
      error?.status === 429 || 
      error?.code === 429 || 
      error?.status === 503 || // Server overload
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.status === 'UNAVAILABLE' ||
      error?.message?.includes('429') ||
      error?.message?.includes('503') ||
      error?.message?.includes('Quota exceeded') ||
      error?.message?.includes('busy') ||
      error?.message?.includes('RESOURCE_EXHAUSTED');

    if (isRateLimit && retries > 0) {
      console.warn(`Quota/Server limit hit. Retrying in ${delay/1000}s... (Attempts left: ${retries})`);
      await wait(delay);
      return retryWithBackoff(operation, retries - 1, delay * 1.5); // 1.5x backoff
    }

    if (isRateLimit) {
      // Return a clearer error after all retries fail
      throw new Error("Server is currently busy or daily quota reached. Please try again in a few minutes.");
    }
    
    throw error;
  }
}

const POSE_PROMPTS: Record<string, string> = {
  [PoseType.STANDING_FRONT]: "standing straight facing the camera",
  [PoseType.CONTRAPPOSTO]: "standing with weight on one leg, body forming a natural curve (contrapposto)",
  [PoseType.WALKING]: "walking or mid-step, dynamic movement",
  [PoseType.HAND_ON_HIP]: "standing with hand on hip, accentuating the silhouette",
  [PoseType.CROSSED_LEGS]: "position with crossed legs, casual and stylish",
  [PoseType.SITTING_CASUAL]: "sitting naturally, body slightly leaning",
  [PoseType.SHOULDER_TURN]: "shoulders turned, head slightly turned to camera",
  [PoseType.THREE_QUARTER]: "body at a three-quarter angle to show dimensionality"
};

// Map internal ratio keywords to API supported strings
// API supports: "1:1", "3:4", "4:3", "9:16", "16:9"
const IMAGE_RATIO_MAP: Record<AspectRatio, string> = {
  [AspectRatio.RATIO_1_1]: "1:1",
  [AspectRatio.RATIO_4_5]: "3:4", // Closest vertical approximation
  [AspectRatio.RATIO_9_16]: "9:16",
  [AspectRatio.RATIO_16_9]: "16:9",
  [AspectRatio.RATIO_3_2]: "4:3"   // Closest horizontal approximation
};

const RATIO_PROMPT_INSTRUCTIONS: Record<AspectRatio, string> = {
  [AspectRatio.RATIO_1_1]: "square (1:1)",
  [AspectRatio.RATIO_4_5]: "portrait (4:5)",
  [AspectRatio.RATIO_9_16]: "vertical full screen (9:16)",
  [AspectRatio.RATIO_16_9]: "cinematic landscape (16:9)",
  [AspectRatio.RATIO_3_2]: "commercial horizontal (3:2)"
};

/**
 * Feature 1: Outfit Swap
 * Now supports optional handheld product.
 */
export const swapOutfit = async (
  apiKey: string,
  characterImage: ImageFile,
  outfitImage: ImageFile,
  pose: PoseType = PoseType.ORIGINAL,
  ratio: AspectRatio = AspectRatio.RATIO_1_1,
  handheldProduct?: ImageFile
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
  
  let poseInstruction = "STRICTLY maintain the identity, face, expression, pose, and body proportions of the person in the first image.";
  
  if (pose !== PoseType.ORIGINAL && POSE_PROMPTS[pose]) {
    poseInstruction = `
    1. STRICTLY maintain the identity, face, expression, and body proportions of the person in the first image.
    2. CHANGE the character's pose to: ${POSE_PROMPTS[pose]}. Ensure the anatomy is natural and the clothes drape realistically for this new pose.
    `;
  }

  // Build parts array
  const parts = [
    { text: "" }, // Placeholder for prompt
    {
      inlineData: {
        mimeType: characterImage.mimeType,
        data: cleanBase64(characterImage.base64)
      }
    },
    {
      inlineData: {
        mimeType: outfitImage.mimeType,
        data: cleanBase64(outfitImage.base64)
      }
    }
  ];

  let handheldInstruction = "";
  if (handheldProduct) {
    handheldInstruction = `
    6. HANDHELD ITEM: A third image (product) is provided. You MUST place this product in the character's hand.
       - Adjust the character's fingers and grip to hold the object naturally and realistically.
       - Ensure the product's scale is appropriate relative to the character.
       - Match the lighting and shadows of the product to the scene.
       - If the pose was changed, ensure the product is held naturally within the new pose.
    `;
    parts.push({
      inlineData: {
        mimeType: handheldProduct.mimeType,
        data: cleanBase64(handheldProduct.base64)
      }
    });
  }

  const prompt = `
    You are a professional fashion editor and visual effects artist.
    Task: Replace the clothes of the person in the first image with the outfit shown in the second image.
    ${handheldProduct ? "Also, integrate the product from the third image into the character's hand." : ""}
    
    Requirements:
    ${poseInstruction}
    3. The new outfit must look photorealistic, following the body curvature, lighting, and shadows of the scene.
    4. Composition: Ensure the subject is framed perfectly for a ${RATIO_PROMPT_INSTRUCTIONS[ratio]} aspect ratio. Keep the subject in the main focus area.
    5. Output ONLY the modified image.
    ${handheldInstruction}
  `;

  // Assign full prompt to the first text part
  parts[0].text = prompt;

  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: parts
        },
        config: {
          imageConfig: {
            aspectRatio: IMAGE_RATIO_MAP[ratio]
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error("No image data returned from the model.");
    } catch (error) {
      console.error("Outfit swap failed:", error);
      throw error;
    }
  });
};

/**
 * Feature 2: Product Poster
 */
export const generateProductPoster = async (
  apiKey: string,
  productImage: ImageFile,
  themePrompt: string,
  logoImage?: ImageFile,
  ratio: AspectRatio = AspectRatio.RATIO_1_1
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });

  let logoInstruction = "";
  const parts = [
    { text: "" }, 
    {
      inlineData: {
        mimeType: productImage.mimeType,
        data: cleanBase64(productImage.base64)
      }
    }
  ];

  if (logoImage) {
    logoInstruction = "5. Incorporate the second image (logo) into the poster design. Place it professionally (e.g., in a corner or balanced position) as a branding element. Do not distort the logo text or shape.";
    parts.push({
      inlineData: {
        mimeType: logoImage.mimeType,
        data: cleanBase64(logoImage.base64)
      }
    });
  }

  const fullPrompt = `
    You are a world-class product photographer and marketing designer.
    Task: Create a high-end commercial poster for the product in the first image.
    ${logoImage ? "The second image provided is the brand logo." : ""}
    
    Instructions:
    1. Keep the product EXACTLY as it is (do not distort shape, label, or details).
    2. Remove the original background and replace it with a background described as: "${themePrompt}".
    3. Ensure the lighting on the product matches the new environment naturally.
    4. Composition: Optimize the layout for a ${RATIO_PROMPT_INSTRUCTIONS[ratio]} format. The product should be the central focus, balanced with negative space and background elements.
    ${logoInstruction}
  `;

  parts[0].text = fullPrompt;

  return retryWithBackoff(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: {
          imageConfig: {
            aspectRatio: IMAGE_RATIO_MAP[ratio]
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      throw new Error("No image generated.");
    } catch (error) {
      console.error("Poster generation failed:", error);
      throw error;
    }
  });
};

const VEO_RATIO_MAP: Record<AspectRatio, string> = {
  [AspectRatio.RATIO_1_1]: "16:9", 
  [AspectRatio.RATIO_4_5]: "9:16", 
  [AspectRatio.RATIO_9_16]: "9:16",
  [AspectRatio.RATIO_16_9]: "16:9",
  [AspectRatio.RATIO_3_2]: "16:9" 
};

/**
 * Feature 3: Video Generation with Veo
 */
export const generateVideo = async (
  apiKey: string,
  prompt: string,
  refImage?: ImageFile,
  ratio: AspectRatio = AspectRatio.RATIO_16_9
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
  
  const config = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: VEO_RATIO_MAP[ratio] || '16:9'
  };
  
  const request: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: config
  };

  if (refImage) {
    request.image = {
        imageBytes: cleanBase64(refImage.base64),
        mimeType: refImage.mimeType
    };
  }

  // Initiate generation
  let operation = await retryWithBackoff(async () => {
      return await ai.models.generateVideos(request);
  });

  // Poll for completion
  while (!operation.done) {
    await wait(5000); // 5s interval
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
      throw new Error("Video generation failed or returned no URI.");
  }

  // Fetch the actual video content
  const fetchUrl = `${videoUri}&key=${apiKey || process.env.API_KEY}`;
  const response = await fetch(fetchUrl);
  
  if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
