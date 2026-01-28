# Google OAuth Setup Guide

Your application is trying to use Google OAuth, but it's not configured in Supabase yet. Follow these steps to enable it:

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Your E-Commerce App
   - Support email: your-email@example.com
   - Add authorized domains if needed
6. For the OAuth client:
   - Application type: **Web application**
   - Name: "Supabase Auth"
   - Authorized JavaScript origins:
     ```
     https://<your-project-ref>.supabase.co
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     http://localhost:3000/auth/v1/callback
     ```
7. Click **Create** and copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list
5. Enable the toggle
6. Paste your **Client ID** and **Client Secret** from Google Cloud Console
7. The Site URL should be: `http://localhost:3000` (for development)
8. Add your production URL when deploying
9. Click **Save**

## Step 3: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Try signing up with Google
3. You should be redirected to Google's login page
4. After authentication, you'll be redirected back to your app

## Alternative: Disable Google Login (Temporary)

If you want to disable Google login temporarily, you can comment out the Google login buttons in:
- `src/customer/pages/Auth/UserLogin.jsx`
- `src/customer/pages/Auth/UserSignup.jsx`
- `src/vendor/pages/VendorLogin.jsx`
- `src/vendor/pages/VendorSignup.jsx`

## Troubleshooting

- **Error "redirect_uri_mismatch"**: Make sure the redirect URI in Google Cloud Console matches exactly with your Supabase callback URL
- **Error "OAuth secret missing"**: You haven't configured the Google provider in Supabase yet
- **Error "Access blocked"**: Complete the OAuth consent screen configuration in Google Cloud Console

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for sensitive configuration
- For production, use HTTPS for all redirect URIs
