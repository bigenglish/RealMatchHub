import { Router } from 'express';
import { 
  analyzeImageFromBase64, 
  analyzeImageFromUrl, 
  extractArchitecturalStyles, 
  extractColorScheme, 
  extractDesignFeatures,
  extractInteriorStyles
} from '../vision-service';

const router = Router();

// Analyze an uploaded image (base64)
router.post('/analyze-image', async (req, res) => {
  try {
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image parameter' });
    }

    // Analyze the image
    const analysisResult = await analyzeImageFromBase64(base64Image);
    
    if (!analysisResult) {
      return res.status(500).json({ error: 'Failed to analyze image' });
    }

    // Extract useful information from the analysis
    const architecturalStyle = extractArchitecturalStyles(analysisResult);
    const interiorStyle = extractInteriorStyles(analysisResult);
    const colorScheme = extractColorScheme(analysisResult);
    const designFeatures = extractDesignFeatures(analysisResult);

    // Return the results
    res.json({
      architecturalStyle,
      interiorStyle,
      colorScheme,
      designFeatures,
      // Include a simplified version of the raw analysis for debugging
      rawLabels: analysisResult.labelAnnotations?.map((label: any) => ({
        description: label.description,
        score: label.score
      }))
    });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'An error occurred while analyzing the image' });
  }
});

// Analyze an image from a URL
router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing imageUrl parameter' });
    }

    // Analyze the image
    const analysisResult = await analyzeImageFromUrl(imageUrl);
    
    if (!analysisResult) {
      return res.status(500).json({ error: 'Failed to analyze image URL' });
    }

    // Extract useful information from the analysis
    const architecturalStyle = extractArchitecturalStyles(analysisResult);
    const interiorStyle = extractInteriorStyles(analysisResult);
    const colorScheme = extractColorScheme(analysisResult);
    const designFeatures = extractDesignFeatures(analysisResult);

    // Return the results
    res.json({
      architecturalStyle,
      interiorStyle,
      colorScheme,
      designFeatures,
      // Include a simplified version of the raw analysis for debugging
      rawLabels: analysisResult.labelAnnotations?.map((label: any) => ({
        description: label.description,
        score: label.score
      }))
    });
  } catch (error: any) {
    console.error('Error analyzing image URL:', error);
    res.status(500).json({ error: error.message || 'An error occurred while analyzing the image URL' });
  }
});

export default router;