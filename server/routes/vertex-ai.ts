
import { Router } from 'express';
import { generatePropertyDescription } from '../vertex-ai';

const router = Router();

router.post('/generate-description', async (req, res) => {
  try {
    const { features, propertyType, location, images } = req.body;
    const description = await generatePropertyDescription({
      features,
      propertyType,
      location,
      images
    });
    res.json({ success: true, description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ success: false, error: 'Failed to generate description' });
  }
});

export default router;
