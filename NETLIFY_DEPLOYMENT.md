# Netlify Deployment Guide for CCShop Panel

This guide will walk you through deploying your CCShop Panel application to Netlify.

## 🚀 Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Connect to GitHub**
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Select the `DoomsdayProd/ccshop-panel` repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `build/client`
   - **Node version**: `18` (or higher)

3. **Set Environment Variables**
   - Click "Advanced" → "New variable"
   - Add these variables:
     ```
     NETLIFY_DATABASE_URL=your_neon_database_connection_string
     BOT_TOKEN=8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU
     ADMIN_CHAT_ID=7890791560
     ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete

### Option 2: Manual Deploy

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Go to your Netlify dashboard
   - Drag and drop the `build/client` folder
   - Or use the Netlify CLI: `netlify deploy --dir=build/client --prod`

## ⚙️ Configuration

### Build Settings

The application is configured with these build settings:

- **Framework**: React (SPA)
- **Build Command**: `npm run build`
- **Output Directory**: `build/client`
- **Node Version**: 18+

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NETLIFY_DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `BOT_TOKEN` | Telegram bot token | `8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU` |
| `ADMIN_CHAT_ID` | Admin chat ID | `7890791560` |

### Database Setup

1. **Create Neon Database**
   - Go to [Neon](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Initialize Database**
   - The application will automatically create tables on first run
   - Tables include: `bot_settings`, `users`, `data_entries`, `orders`, `wallet_transactions`

## 🔧 Netlify Functions

The application includes Netlify functions for API endpoints:

### Function Structure
```
netlify/
├── functions/
│   ├── api.js          # Main API handler
│   └── package.json    # Function dependencies
```

### API Endpoints

- `GET /.netlify/functions/api/bot-settings` - Get bot settings
- `POST /.netlify/functions/api/bot-settings` - Update bot settings
- `POST /.netlify/functions/api/bot-settings/test-connection` - Test bot connection

### Function Dependencies

The functions use `@netlify/neon` for database access. Dependencies are automatically installed by Netlify.

## 📱 Bot Configuration

### Default Settings

The application comes pre-configured with:

- **Bot Token**: `8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU`
- **Admin ID**: `7890791560`

### Setting Up Your Bot

1. **Create Bot with @BotFather**
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Use `/newbot` command
   - Follow the setup instructions

2. **Get Your Chat ID**
   - Message [@userinfobot](https://t.me/userinfobot)
   - It will reply with your chat ID

3. **Configure Webhook**
   - Set webhook URL to: `https://yourdomain.netlify.app/.netlify/functions/api/webhook`

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (must be 18+)
   - Ensure all dependencies are installed
   - Check build logs for specific errors

2. **Database Connection Fails**
   - Verify `NETLIFY_DATABASE_URL` is correct
   - Check if Neon database is accessible
   - Ensure database has the required tables

3. **Bot Not Responding**
   - Verify bot token is correct
   - Check if webhook URL is properly set
   - Ensure bot is not blocked

4. **Environment Variables Not Working**
   - Redeploy after setting environment variables
   - Check variable names (case-sensitive)
   - Restart the site if needed

### Debug Mode

Enable debug logging by adding:
```
DEBUG=true
```

### Support

If you encounter issues:

1. Check the [Netlify Status Page](https://status.netlify.com)
2. Review build logs in your Netlify dashboard
3. Check the [GitHub Issues](https://github.com/DoomsdayProd/ccshop-panel/issues)

## 🔄 Updates and Maintenance

### Automatic Deployments

- Every push to the `main` branch triggers a new deployment
- Netlify automatically builds and deploys your changes

### Manual Updates

1. **Update Dependencies**
   ```bash
   npm update
   git add package*.json
   git commit -m "Update dependencies"
   git push origin main
   ```

2. **Database Migrations**
   - The application handles schema updates automatically
   - No manual migration steps required

### Monitoring

- **Build Status**: Check Netlify dashboard for build status
- **Performance**: Use Netlify Analytics to monitor site performance
- **Errors**: Check function logs for API errors

## 🎯 Next Steps

After successful deployment:

1. **Test the Application**
   - Visit your Netlify URL
   - Navigate to `/admin` to access the admin panel
   - Test bot settings configuration

2. **Configure Your Bot**
   - Update bot token and admin ID if needed
   - Set up webhook URL
   - Test bot connectivity

3. **Customize**
   - Modify bot messages and settings
   - Add your own branding
   - Configure notification preferences

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Neon Documentation](https://neon.tech/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [React Router Documentation](https://reactrouter.com)

---

**Happy Deploying! 🚀**

Your CCShop Panel should now be live on Netlify with full bot management capabilities.
