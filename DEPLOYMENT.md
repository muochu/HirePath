# Deployment Guide for HirePath

This guide will help you deploy your HirePath application to make it publicly accessible.

## Backend Deployment (Render)

1. Create a [Render](https://render.com/) account if you don't have one.

2. Create a new Web Service and connect it to your GitHub repository.

3. Configure the service:
   - **Name**: hirepath-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

4. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `PORT`: 5000

5. Deploy the service.

## Frontend Deployment (Vercel)

1. Create a [Vercel](https://vercel.com/) account if you don't have one.

2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

3. Navigate to your project directory and run:
   ```
   vercel login
   ```

4. Deploy the frontend:
   ```
   cd frontend
   vercel
   ```

5. Follow the prompts to complete the deployment.

6. Configure environment variables in the Vercel dashboard:
   - `REACT_APP_API_URL`: The URL of your backend service (e.g., https://hirepath-backend.onrender.com)

## Alternative Deployment Options

### Backend Alternatives
- [Railway](https://railway.app/)
- [Heroku](https://www.heroku.com/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)

### Frontend Alternatives
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Firebase Hosting](https://firebase.google.com/products/hosting)

## Testing Your Deployment

1. Visit your frontend URL (e.g., https://hirepath.vercel.app)
2. Create a new account
3. Test the application functionality
4. Share the URL with others for testing

## Troubleshooting

- If you encounter CORS issues, ensure your backend is configured to accept requests from your frontend domain.
- Check the logs in your deployment platform for any errors.
- Verify that all environment variables are correctly set. 