import express from 'express';
import { z } from 'zod';
import {
  auth,
  getUserByEmail,
  createUser,
  getUserById,
  setUserRole,
  getUserRole,
  verifyIdToken
} from '../firebase-admin';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'vendor', 'admin']).default('user'),
});

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['user', 'vendor', 'admin']),
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);
    
    try {
      // Firebase Admin SDK doesn't have a direct method to sign in with email/password
      // We need to use Firebase Client SDK for that
      // Here we just check if the user exists
      const userRecord = await getUserByEmail(email);
      
      // Return user details (without sensitive information)
      res.status(200).json({
        success: true,
        message: 'User found, please use Firebase client SDK to login',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          // Do not send passwordHash, phoneNumber, etc.
        }
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const { fullName, email, password, role } = registerSchema.parse(req.body);
    
    try {
      // Create a new user
      const userRecord = await createUser(email, password, fullName);
      
      // Set the user's role
      await setUserRole(userRecord.uid, role);
      
      // Return user details (without sensitive information)
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role,
        }
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        res.status(409).json({
          success: false,
          message: 'Email already in use',
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }
    
    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the token
      const decodedToken = await verifyIdToken(idToken);
      
      // Get the user details
      const userRecord = await getUserById(decodedToken.uid);
      
      // Get the user's role
      const role = await getUserRole(decodedToken.uid);
      
      // Return user details
      res.status(200).json({
        success: true,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role,
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the profile',
    });
  }
});

// Update user role
router.post('/update-role', async (req, res) => {
  try {
    // Validate request body
    const { userId, role } = updateRoleSchema.parse(req.body);
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }
    
    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the token
      const decodedToken = await verifyIdToken(idToken);
      
      // Get the user's role
      const userRole = await getUserRole(decodedToken.uid);
      
      // Only admins can update roles
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only admins can update roles',
        });
      }
      
      // Set the user's role
      await setUserRole(userId, role);
      
      // Return success
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
      });
    }
  } catch (error) {
    console.error('Update role error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the role',
    });
  }
});

export default router;