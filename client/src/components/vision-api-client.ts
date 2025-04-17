/**
 * Client for the Vision API for analyzing property images
 */

/**
 * Analyze an image using Google Vision API
 * @param base64Image Base64 encoded image data
 * @returns Vision API analysis results
 */
export async function analyzeImageUpload(base64Image: string) {
  try {
    const response = await fetch('/api/vision/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      throw new Error(`Error analyzing image: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Vision API:', error);
    throw error;
  }
}

/**
 * Analyze an image URL using Google Vision API
 * @param imageUrl URL of the image to analyze
 * @returns Vision API analysis results
 */
export async function analyzeImageUrl(imageUrl: string) {
  try {
    const response = await fetch('/api/vision/analyze-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Error analyzing image URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Vision API for URL:', error);
    throw error;
  }
}