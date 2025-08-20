
import { Save, Bot, AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";

export function BotSettingsTab({
  botSettingsData,
  settingsLoading,
  editingSettings,
  handleSettingChange,
  settingsChanged,
  handleSaveSettings,
  updateSettingsMutation,
}) {
  const [validationErrors, setValidationErrors] = useState({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResults, setConnectionResults] = useState(null);
  const [setupResult, setSetupResult] = useState(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateSetting = (key, value, type) => {
    const errors = {};
    
    switch (type) {
      case "boolean":
        if (value !== "true" && value !== "false") {
          errors[key] = "Must be true or false";
        }
        break;
      case "number":
        if (isNaN(value) || value === "") {
          errors[key] = "Must be a valid number";
        } else if (parseFloat(value) < 0) {
          errors[key] = "Must be a positive number";
        }
        break;
      case "text":
        if (value.trim() === "") {
          errors[key] = "Cannot be empty";
        }
        break;
    }
    
    return errors;
  };

  const handleSettingChangeWithValidation = (key, value) => {
    const errors = validateSetting(key, value, getSettingType(key));
    setValidationErrors(prev => ({ ...prev, [key]: errors[key] }));
    handleSettingChange(key, value);
  };

  const getSettingType = (key) => {
    const setting = botSettingsData?.rawSettings?.find(s => s.setting_key === key);
    return setting?.setting_type || "text";
  };

  const renderInput = (setting) => {
    const value = editingSettings[setting.setting_key] || "";
    const onChange = (e) => handleSettingChangeWithValidation(setting.setting_key, e.target.value);
    const hasError = validationErrors[setting.setting_key];
    
    const commonProps = {
      value,
      onChange,
      className: `w-full px-4 py-3 bg-white/10 dark:bg-white/5 border rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
        hasError 
          ? "border-red-400 focus:ring-red-400" 
          : "border-white/20 dark:border-white/10 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845]"
      }`,
    };

    switch (setting.setting_type) {
      case "boolean":
        return (
          <select {...commonProps}>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      case "number":
        return (
          <div>
            <input type="number" step="0.01" min="0" {...commonProps} />
            {setting.setting_key === "payment_timeout_hours" && (
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Recommended: 1-72 hours
              </div>
            )}
            {setting.setting_key === "max_cart_items" && (
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Recommended: 5-50 items
              </div>
            )}
          </div>
        );
      case "text":
        if (setting.setting_key === "bot_token") {
          return (
            <div>
              <input type="text" {...commonProps} placeholder="8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Bot token format: [bot_id]:[bot_hash]. Current token is pre-configured.
              </div>
            </div>
          );
        } else if (setting.setting_key === "admin_chat_id") {
          return (
            <div>
              <input type="text" {...commonProps} placeholder="7890791560" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Admin chat ID is pre-configured. Use @userinfobot to get other chat IDs.
              </div>
            </div>
          );
        } else if (setting.setting_key === "database_url") {
          return (
            <div>
              <input type="text" {...commonProps} placeholder="postgresql://user:password@host:port/database" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Neon PostgreSQL connection string. Format: postgresql://user:password@host:port/database
              </div>
            </div>
          );
        } else if (setting.setting_key === "webhook_url") {
          return (
            <div>
              <input type="url" {...commonProps} placeholder="https://your-app.netlify.app/api/bot/webhook" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Your app's webhook URL for Telegram bot updates. Must be HTTPS for production.
              </div>
            </div>
          );
        } else if (setting.setting_key === "app_url") {
          return (
            <div>
              <input type="url" {...commonProps} placeholder="https://your-app.netlify.app" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Your app's public URL (for Mini App links and webhook configuration).
              </div>
            </div>
          );
        } else if (setting.setting_key === "welcome_message") {
          return (
            <div>
              <textarea 
                {...commonProps} 
                rows={4}
                placeholder="🎉 Welcome to Data Shop! I'm your personal shopping assistant..."
              />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Custom welcome message for new users. Use {first_name} for user's first name.
              </div>
            </div>
          );
        } else if (setting.setting_key === "notification_settings") {
          return (
            <div>
              <textarea 
                {...commonProps} 
                rows={3}
                placeholder='{"purchase_notifications": true, "order_updates": true, "admin_alerts": true}'
              />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                JSON format notification preferences. Configure which notifications to send.
              </div>
            </div>
          );
        } else if (setting.setting_key.includes("message")) {
          return (
            <div>
              <textarea rows={4} {...commonProps} placeholder="Enter your custom message here..." />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Custom message template. Use variables like {user_name}, {order_id}, etc.
              </div>
            </div>
          );
        } else if (setting.setting_key.includes("quiet_hours")) {
          return (
            <div>
              <input type="time" {...commonProps} />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Use 24-hour format (HH:MM)
              </div>
            </div>
          );
        } else if (setting.setting_key === "emergency_contact") {
          return (
            <div>
              <input type="text" {...commonProps} placeholder="Chat ID or username" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Use @userinfobot to get chat ID
              </div>
            </div>
          );
        } else if (setting.setting_key === "bot_language") {
          return (
            <div>
              <select {...commonProps}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="ru">Русский</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="ar">العربية</option>
                <option value="hi">हिन्दी</option>
              </select>
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Select the primary language for bot responses
              </div>
            </div>
          );
        } else if (setting.setting_key === "connected_channels") {
          return (
            <div>
              <textarea 
                {...commonProps} 
                rows={3}
                placeholder="Enter channel usernames or IDs, one per line&#10;Example:&#10;@mychannel&#10;-1001234567890"
              />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                One channel per line. Use @username or -100xxxxxxxxx format
              </div>
            </div>
          );
        } else if (setting.setting_key === "connected_groups") {
          return (
            <div>
              <textarea 
                {...commonProps} 
                rows={3}
                placeholder="Enter group usernames or IDs, one per line&#10;Example:&#10;@mygroup&#10;-1001234567890"
              />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                One group per line. Use @username or -100xxxxxxxxx format
              </div>
            </div>
          );
        }
        return <input type="text" {...commonProps} />;
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  const getSettingCategory = (settingKey) => {
    if (["bot_token", "webhook_url", "admin_chat_id", "emergency_contact"].includes(settingKey)) {
      return "Bot Configuration";
    } else if (["connected_channels", "connected_groups"].includes(settingKey)) {
      return "Connected Channels & Groups";
    } else if (["auto_approve_orders", "payment_timeout_hours", "max_cart_items", "currency"].includes(settingKey)) {
      return "Business Rules";
    } else if (["notification_enabled", "maintenance_mode", "bot_status_check_interval", "backup_enabled", "backup_interval_hours"].includes(settingKey)) {
      return "System Settings";
    } else if (settingKey.includes("message")) {
      return "Bot Messages";
    } else if (settingKey.includes("notification") || settingKey.includes("alert") || settingKey.includes("summary") || settingKey.includes("report")) {
      return "Notifications & Alerts";
    } else if (settingKey.includes("quiet_hours") || settingKey.includes("sound")) {
      return "Notification Preferences";
    } else if (settingKey.includes("threshold") || settingKey.includes("stock")) {
      return "Alert Thresholds";
    } else if (["bot_language", "auto_delete_commands", "max_message_length", "inline_keyboard_enabled", "rate_limit_per_user"].includes(settingKey)) {
      return "Bot Behavior";
    }
    return "General";
  };

  const groupedSettings = botSettingsData?.rawSettings?.reduce((groups, setting) => {
    const category = getSettingCategory(setting.setting_key);
    if (!groups[category]) groups[category] = [];
    groups[category].push(setting);
    return groups;
  }, {}) || {};

  const hasValidationErrors = Object.keys(validationErrors).some(key => validationErrors[key]);

  const testBotConnection = async () => {
    setTestingConnection(true);
    setConnectionResults(null);
    
    try {
      const response = await fetch('/api/bot-settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: editingSettings.bot_token || '',
          webhook_url: editingSettings.webhook_url || '',
          admin_chat_id: editingSettings.admin_chat_id || ''
        })
      });
      
      if (response.ok) {
        const results = await response.json();
        setConnectionResults(results);
      } else {
        setConnectionResults({ 
          status: 'error', 
          results: { 
            general: { status: 'error', message: 'Failed to test connection' } 
        }
      });
    }
  } catch (error) {
    setConnectionResults({ 
      status: 'error', 
      results: { 
        general: { status: 'error', message: error.message } 
      } 
    });
  } finally {
    setTestingConnection(false);
  }
};

  const setupBot = async (action) => {
    setIsLoading(true);
    setSetupResult(null);
    
    try {
      const response = await fetch('/api/bot/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSetupResult(result);
      } else {
        const error = await response.json();
        setSetupResult({ success: false, error: error.error || 'Setup failed' });
      }
    } catch (error) {
      setSetupResult({ success: false, error: error.message || 'Setup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickConfig = async (action) => {
    setIsLoading(true);
    
    try {
      switch (action) {
        case 'database':
          // Test database connection
          const dbResponse = await fetch('/api/bot-settings/test-connection');
          if (dbResponse.ok) {
            alert('✅ Database connection successful!');
          } else {
            alert('❌ Database connection failed. Check your DATABASE_URL.');
          }
          break;
          
        case 'webhook':
          // Test webhook configuration
          if (editingSettings.webhook_url) {
            alert(`🔗 Webhook URL configured: ${editingSettings.webhook_url}`);
          } else {
            alert('⚠️ Webhook URL not configured. Set it in the settings above.');
          }
          break;
          
        case 'bot':
          // Test bot token
          if (editingSettings.bot_token) {
            const botResponse = await fetch(`https://api.telegram.org/bot${editingSettings.bot_token}/getMe`);
            if (botResponse.ok) {
              const botInfo = await botResponse.json();
              alert(`✅ Bot API working! Bot: @${botInfo.result.username}`);
            } else {
              alert('❌ Bot token invalid. Check your bot token.');
            }
          } else {
            alert('⚠️ Bot token not configured. Set it in the settings above.');
          }
          break;
          
        case 'validate':
          // Validate all required settings
          const requiredFields = ['bot_token', 'admin_chat_id', 'database_url'];
          const missingFields = requiredFields.filter(field => !editingSettings[field]);
          
          if (missingFields.length === 0) {
            alert('✅ All required settings are configured!');
          } else {
            alert(`⚠️ Missing required fields: ${missingFields.join(', ')}`);
          }
          break;
          
        case 'export':
          // Export current configuration
          const config = {
            bot_token: editingSettings.bot_token,
            admin_chat_id: editingSettings.admin_chat_id,
            database_url: editingSettings.database_url,
            webhook_url: editingSettings.webhook_url,
            app_url: editingSettings.app_url,
            export_date: new Date().toISOString()
          };
          
          const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'bot-config.json';
          a.click();
          URL.revokeObjectURL(url);
          alert('📤 Configuration exported successfully!');
          break;
          
        case 'import':
          // Import configuration
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
              try {
                const text = await file.text();
                const config = JSON.parse(text);
                
                // Update settings with imported values
                Object.keys(config).forEach(key => {
                  if (key !== 'export_date') {
                    handleSettingChange(key, config[key]);
                  }
                });
                
                alert('📥 Configuration imported successfully!');
              } catch (error) {
                alert('❌ Failed to import configuration. Invalid JSON file.');
              }
            }
          };
          input.click();
          break;
          
        default:
          alert('Unknown action');
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'error': return <AlertCircle size={16} className="text-red-400" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-400" />;
      default: return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-instrument font-medium text-white dark:text-gray-100">
          Bot Settings
        </h2>
          <p className="text-sm text-white/60 dark:text-gray-400 mt-1">
            Configure your Telegram bot behavior and marketplace settings
          </p>
          <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300 dark:text-blue-400">
              <strong>Quick Setup:</strong> Bot Token and Admin ID are pre-configured! Start by setting up your webhook URL and connecting your channels/groups. 
              Use the "Test Connection" button to verify your settings.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={testBotConnection}
            disabled={testingConnection || !editingSettings.bot_token}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-inter font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingConnection ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span>{testingConnection ? "Testing..." : "Test Connection"}</span>
          </button>
          
        {settingsChanged && (
          <button
            onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending || hasValidationErrors}
            className="flex items-center space-x-2 bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-4 py-2 rounded-xl font-inter font-semibold transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}</span>
          </button>
        )}
      </div>
      </div>

      {settingsLoading ? (
        <div className="text-center py-8 text-white/60 dark:text-gray-500">Loading settings...</div>
      ) : (
        <>
          {/* Configuration Summary */}
          <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5 p-6 mb-8">
            <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4">
              Configuration Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white/90 dark:text-gray-200">
                  {editingSettings.bot_token ? '✅' : '❌'}
                </div>
                <div className="text-sm text-white/70 dark:text-gray-400">Bot Token</div>
                <div className="text-xs text-white/50 dark:text-gray-500">
                  {editingSettings.bot_token ? 'Configured' : 'Not set'}
                </div>
              </div>
              <div className="text-center p-3 bg-white/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white/90 dark:text-gray-200">
                  {editingSettings.admin_chat_id ? '✅' : '❌'}
                </div>
                <div className="text-sm text-white/70 dark:text-gray-400">Admin ID</div>
                <div className="text-xs text-white/50 dark:text-gray-500">
                  {editingSettings.admin_chat_id ? 'Configured' : 'Not set'}
                </div>
              </div>
              <div className="text-center p-3 bg-white/5 dark:bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-white/90 dark:text-gray-200">
                  {editingSettings.connected_channels || editingSettings.connected_groups ? '✅' : '❌'}
                </div>
                <div className="text-sm text-white/70 dark:text-gray-400">Channels/Groups</div>
                <div className="text-xs text-white/50 dark:text-gray-500">
                  {editingSettings.connected_channels || editingSettings.connected_groups ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
          </div>

          {/* Essential Configuration Fields */}
          <div className="bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5 p-6 mb-8">
            <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4">
              🔑 Essential Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bot Token */}
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  Bot Token *
                </label>
                <input
                  type="text"
                  value={editingSettings.bot_token || ''}
                  onChange={(e) => handleSettingChange('bot_token', e.target.value)}
                  placeholder="8338045292:AAH06vDlDVaeo8RfZUmT155Qn9unwA9knfU"
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                />
                <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                  Get from @BotFather. Format: [bot_id]:[bot_hash]
                </div>
              </div>

              {/* Admin Chat ID */}
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  Admin Chat ID *
                </label>
                <input
                  type="text"
                  value={editingSettings.admin_chat_id || ''}
                  onChange={(e) => handleSettingChange('admin_chat_id', e.target.value)}
                  placeholder="7890791560"
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                />
                <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                  Your Telegram chat ID. Use @userinfobot to get it
                </div>
              </div>

              {/* Database URL */}
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  Database URL *
                </label>
                <input
                  type="text"
                  value={editingSettings.database_url || ''}
                  onChange={(e) => handleSettingChange('database_url', e.target.value)}
                  placeholder="postgresql://user:password@host:port/database"
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                />
                <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                  Neon PostgreSQL connection string
                </div>
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={editingSettings.webhook_url || ''}
                  onChange={(e) => handleSettingChange('webhook_url', e.target.value)}
                  placeholder="https://your-app.netlify.app/api/bot/webhook"
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                />
                <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                  Your app's webhook endpoint for bot updates
                </div>
              </div>

              {/* App URL */}
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  App URL
                </label>
                <input
                  type="url"
                  value={editingSettings.app_url || ''}
                  onChange={(e) => handleSettingChange('app_url', e.target.value)}
                  placeholder="https://your-app.netlify.app"
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                />
                <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                  Your app's public URL for Mini App links
                </div>
              </div>

              {/* Connected Channels */}
              <div>
                <label className="block text-sm font-inter font-medium text-white/90 dark:text-gray-300 mb-2">
                  Connected Channels
                </label>
                <textarea
                  value={editingSettings.connected_channels || ''}
                  onChange={(e) => handleSettingChange('connected_channels', e.target.value)}
                  placeholder="@channel1, @channel2, @channel3"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D6FF57] dark:focus:ring-[#B8E845] focus:border-transparent"
                />
                <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                  Comma-separated channel usernames or IDs
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-white/70 dark:text-gray-400">
                <span className="text-red-400">*</span> Required fields
              </div>
              <button
                onClick={() => handleQuickConfig('validate')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
              >
                ✅ Validate All Settings
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedSettings).map(([category, settings]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 border-b border-white/20 dark:border-white/10 pb-2">
                {category}
              </h3>
              <div className="grid gap-4">
                {settings.map((setting) => {
                  const isKeyField = ["bot_token", "admin_chat_id", "connected_channels", "connected_groups"].includes(setting.setting_key);
                  return (
                  <div key={setting.setting_key} className={`rounded-xl p-4 border transition-all duration-200 ${
                    isKeyField 
                      ? "bg-blue-500/10 dark:bg-blue-500/5 border-blue-500/20 dark:border-blue-500/10" 
                      : "bg-white/5 dark:bg-white/5 border-white/10 dark:border-white/5"
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                <label className="text-sm font-inter font-medium text-white/90 dark:text-gray-300">
                  {setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </label>
                        <div className="text-xs text-white/60 dark:text-gray-500 mt-1">
                          {setting.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-white/50 dark:text-gray-500" />
                        {isKeyField && (
                          <span className="text-xs text-blue-300 dark:text-blue-400 px-2 py-1 bg-blue-500/20 dark:bg-blue-500/10 rounded border border-blue-500/30">
                            Key Field
                          </span>
                        )}
                        <span className="text-xs text-white/40 dark:text-gray-600 px-2 py-1 bg-white/10 dark:bg-white/5 rounded">
                          {setting.setting_type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {renderInput(setting)}
                    </div>
                    
                    {validationErrors[setting.setting_key] && (
                      <div className="flex items-center space-x-2 text-red-400 text-sm">
                        <AlertCircle size={14} />
                        <span>{validationErrors[setting.setting_key]}</span>
                      </div>
                    )}
                    
                    {setting.updated_at && (
                      <div className="text-xs text-white/40 dark:text-gray-600">
                        Last updated: {new Date(setting.updated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {/* Quick Configuration Actions */}
      <div className="mt-8 bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5 p-6">
        <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4">
          ⚙️ Quick Configuration Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => handleQuickConfig('database')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
          >
            🗄️ Test Database
          </button>
          
          <button
            onClick={() => handleQuickConfig('webhook')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
          >
            🔗 Test Webhook
          </button>
          
          <button
            onClick={() => handleQuickConfig('bot')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
          >
            🤖 Test Bot API
          </button>
          
          <button
            onClick={() => handleQuickConfig('validate')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
          >
            ✅ Validate Settings
          </button>
          
          <button
            onClick={() => handleQuickConfig('export')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
          >
            📤 Export Config
          </button>
          
          <button
            onClick={() => handleQuickConfig('import')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200"
          >
            📥 Import Config
          </button>
        </div>

        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-300 dark:text-yellow-400">
            <strong>Quick Actions:</strong> Use these buttons to quickly test and validate your configuration. 
            Test Database checks your Neon connection, Test Webhook verifies bot webhook setup, 
            Test Bot API validates your bot token, and Validate Settings checks all required fields.
          </p>
        </div>
      </div>

      {/* Bot Setup & Management */}
      <div className="mt-8 bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5 p-6">
        <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4">
          🤖 Bot Setup & Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setupBot('set_webhook')}
            disabled={isLoading}
            className="bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔗 Set Webhook
          </button>
          
          <button
            onClick={() => setupBot('set_commands')}
            disabled={isLoading}
            className="bg-[#D6FF57] dark:bg-[#B8E845] text-[#001826] dark:text-[#0A0A0A] px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-[#C4F94E] dark:hover:bg-[#A6D93A] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 Set Commands
          </button>
          
          <button
            onClick={() => setupBot('get_webhook_info')}
            disabled={isLoading}
            className="bg-white/10 dark:bg-white/5 text-white dark:text-gray-100 px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10"
          >
            📊 Webhook Info
          </button>
          
          <button
            onClick={() => setupBot('test_bot')}
            disabled={isLoading}
            className="bg-white/10 dark:bg-white/5 text-white dark:text-gray-100 px-4 py-2 rounded-xl font-inter font-medium transition-all duration-200 hover:bg-white/20 dark:hover:bg-white/10 border border-white/20 dark:border-white/10"
          >
            🧪 Test Bot
          </button>
        </div>

        {setupResult && (
          <div className={`p-4 rounded-xl border ${
            setupResult.success 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            <div className="font-medium mb-2">
              {setupResult.success ? '✅ Success' : '❌ Error'}
            </div>
            <div className="text-sm">
              {setupResult.message || setupResult.error}
            </div>
            {setupResult.webhookUrl && (
              <div className="text-xs mt-2 opacity-80">
                Webhook URL: {setupResult.webhookUrl}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300 dark:text-blue-400">
            <strong>Setup Steps:</strong> 1) Click "Set Webhook" to connect your bot to this server. 
            2) Click "Set Commands" to configure bot commands. 3) Use "Test Bot" to verify everything works. 
            4) Start chatting with your bot using /start command!
          </p>
        </div>
      </div>

      {/* Connection Test Results */}
      {connectionResults && (
        <div className="mt-8 bg-white/5 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5 p-6">
          <h3 className="text-lg font-instrument font-medium text-white/90 dark:text-gray-200 mb-4">
            Connection Test Results
          </h3>
          <div className="space-y-3">
            {Object.entries(connectionResults.results).map(([key, result]) => (
              <div key={key} className="flex items-center space-x-3 p-3 bg-white/5 dark:bg-white/5 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="text-sm font-medium text-white/90 dark:text-gray-200 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-white/70 dark:text-gray-400">
                    {result.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-white/50 dark:text-gray-500">
            Tested at: {new Date(connectionResults.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {updateSettingsMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <CheckCircle size={16} />
          <span>Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}
