# Deployment Instructions for Realty.AI

## Prerequisites
- Make sure all environment variables (API keys, secrets) are properly set in the Replit secrets section.
- Ensure the application is running correctly in development mode.

## Deployment Steps on Replit

1. **Use the Deploy Button**: 
   - Click the "Deploy" button in the Replit UI (usually at the top-right of the screen).
   - This will trigger Replit's deployment process.
   - Replit will use the `.replit.deploy` file to build and run the application in production mode.

2. **Verify the Deployment**:
   - After deployment, Replit will provide a URL for your deployed application.
   - Open this URL in a browser to verify that the application is working as expected.
   - Check both the frontend functionality and backend API endpoints.

## Troubleshooting

If you encounter issues with the deployment:

1. **Check Build Logs**:
   - Review the build logs provided by Replit for any errors.
   - Common issues include missing dependencies or build failures.

2. **Verify Environment Variables**:
   - Ensure all required environment variables are properly set in the deployment environment.
   - This includes API keys for Google Cloud, Firebase, Stripe, and IDX Broker.

3. **Check Frontend-Backend Communication**:
   - If the frontend is working but API calls are failing, verify the API endpoints are correctly configured.
   - The API base URL might need to be adjusted based on the deployment domain.

4. **Rollback if Necessary**:
   - If deployment issues persist, you can roll back to a known-good version using Replit's history feature.
   - Then retry the deployment after fixing the identified issues.

## Post-Deployment

After successful deployment:

1. Update the authorized domains in Firebase to include your new deployment URL.
2. Test all critical paths through the application, including:
   - Authentication flows
   - Property search and browsing
   - Payment processing
   - Document uploads and processing
   - Chat functionality

Remember to regularly back up your project to prevent data loss during deployment or updates.