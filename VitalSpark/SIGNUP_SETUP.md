# Sign Up Screen Setup Guide

## Overview

The sign up screen has been created with the same responsive design as the login screen, including full support for Supabase email confirmation with deep linking.

## What Was Implemented

### 1. **Sign Up Screen (`app/(auth)/signup.tsx`)**

- ✅ Same responsive design as login (scales for small and large screens)
- ✅ Three input fields:
  - Email
  - Create Password
  - Confirm Password
- ✅ Full form validation:
  - Email validation
  - Password matching
  - Minimum password length (6 characters)
- ✅ Show/Hide toggle for both password fields
- ✅ Responsive scaling for all screen sizes:
  - Small screens (< 1280 x 800): Scales down to 65% minimum
  - Medium screens (1280 x 800 - 1440 x 1024): 100% baseline
  - Large screens (>= 1440 x 1024): Scales up to 150% maximum
- ✅ Web-specific features:
  - No focus rings on inputs
  - Autofill colors removed

### 2. **Deep Linking Support**

Following the [Supabase Native Mobile Deep Linking Guide](https://supabase.com/docs/guides/auth/native-mobile-deep-linking?utm_source=expo&utm_medium=referral&utm_term=expo-react-native):

#### Updated Files:

- **`utils/supabase.ts`**
  - Added `expo-linking` for deep linking (web-compatible)
  - Created `getRedirectUri()` function for cross-platform deep linking
  - Handles web URLs and native app schemes automatically
  - Updated Supabase client configuration for session detection

- **`hooks/useAuth.ts`**
  - Updated `signUp()` method to include `emailRedirectTo` option
  - Email confirmation links now redirect back to the app

- **`app.json`**
  - Updated scheme to `vitalspark` (consistent across platforms)
  - Added iOS associated domains for universal links
  - Android intent filters already configured

### 3. **Navigation Updates**

- Login screen now navigates to signup screen (instead of showing alert)
- Signup screen navigates back to login after successful registration

## Setup Instructions

### Supabase Configuration

You need to add the redirect URLs to your Supabase project:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add these redirect URLs:

For development:

```
vitalspark://auth/callback
exp://localhost:8081/auth/callback
http://localhost:8081/auth/callback
```

For production (replace with your actual domains):

```
vitalspark://auth/callback
https://yourdomain.com/auth/callback
```

5. Save the changes

### App Configuration

The deep linking scheme is already configured in `app.json`:

- **Scheme**: `vitalspark`
- **iOS**: Associated domains configured
- **Android**: Intent filters configured

### Testing Deep Linking

#### On Development:

1. Start your app: `npm start`
2. Sign up with a valid email
3. Check your email for the confirmation link
4. Click the confirmation link
5. The app should open and handle the authentication

#### On Web:

- Email confirmation will redirect to the web URL you configured
- Session will be automatically restored

#### On Mobile (iOS/Android):

- Email confirmation will trigger the deep link
- App will open and handle the authentication token

## User Flow

1. **User clicks "Create an account" on login screen**
   → Navigates to signup screen

2. **User fills in email, password, and confirm password**
   → Client-side validation runs

3. **User submits the form**
   → API call to Supabase with `emailRedirectTo` parameter

4. **Supabase sends confirmation email**
   → Email contains deep link to app

5. **User clicks link in email**
   → App opens via deep linking
   → Session is automatically created

6. **User is redirected to login screen**
   → Can now sign in with verified account

## Password Requirements

- Minimum 6 characters (enforced by Supabase)
- Both password fields must match

## Error Handling

The signup screen handles:

- Missing fields
- Invalid email format
- Password mismatch
- Weak passwords
- Network errors
- Supabase errors (with friendly messages)

## Package Dependencies

- ✅ `expo-linking` - Used for deep linking (already installed, web-compatible)
- ✅ `expo-web-browser` - Already installed
- ✅ `@supabase/supabase-js` - Already installed
- ✅ `@react-native-async-storage/async-storage` - Already installed

## Next Steps

1. **Configure Supabase redirect URLs** (see instructions above)
2. **Test the signup flow** on your development environment
3. **Create email confirmation callback handler** (if needed for custom UI)
4. **Configure email templates** in Supabase dashboard (optional)

## References

- [Supabase Deep Linking Documentation](https://supabase.com/docs/guides/auth/native-mobile-deep-linking?utm_source=expo&utm_medium=referral&utm_term=expo-react-native)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)
- [Expo Linking API Reference](https://docs.expo.dev/versions/latest/sdk/linking/)
