# Email Setup Guide for Tourism Office

## Overview
This guide explains how to configure the TDMS system to use the Tourism office's Gmail account for sending email notifications to users.

## Current Email Usage
The system sends emails for:
- User account approval notifications
- User account rejection notifications  
- Password reset requests

## Setup Steps

### 1. Prepare Tourism Office Gmail Account

#### Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

#### Generate App-Specific Password
1. In Google Account Settings, go to **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Click **Generate** for a new app password
4. Select **Mail** as the app type
5. Copy the generated 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Update Server Environment Variables

Add or update these variables in your server's `.env` file:

```env
EMAIL_USER=tourismoffice@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important**: 
- Use the Tourism office's Gmail address for `EMAIL_USER`
- Use the app-specific password (not the regular Gmail password) for `EMAIL_PASSWORD`
- Remove spaces from the app password if any

### 3. Test the Configuration

After updating the environment variables:
1. Restart the server
2. Test by creating a new user account
3. Check if approval/rejection emails are sent correctly

## Troubleshooting

### Common Issues

**"Invalid login" error**
- Ensure you're using the app-specific password, not the regular Gmail password
- Verify 2-Factor Authentication is enabled

**"Less secure app access" error**
- This is normal - the app-specific password bypasses this requirement

**Emails not sending**
- Check server logs for specific error messages
- Verify environment variables are correctly set
- Ensure the Gmail account has sufficient storage space

### Security Notes

- The app-specific password is secure and can be revoked if needed
- Never commit the `.env` file to version control
- Regularly rotate the app-specific password for security

## Support

If you encounter issues:
1. Check the server console logs for error messages
2. Verify all environment variables are correctly set
3. Test with a simple email first before going live 