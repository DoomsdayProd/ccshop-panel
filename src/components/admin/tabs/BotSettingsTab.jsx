
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
        } else if (setting.setting_key.includes("message") || setting.setting_key === "webhook_url") {
          return <textarea rows={4} {...commonProps} />;
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
        } else if (setting.setting_key === "webhook_url") {
          return (
            <div>
              <input type="url" {...commonProps} placeholder="https://yourdomain.com/api/webhook" />
              <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                Must be HTTPS for production
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
