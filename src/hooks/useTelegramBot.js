import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import telegramApp from '../utils/telegram';

export const useTelegramBot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [botStatus, setBotStatus] = useState('disconnected');
  const queryClient = useQueryClient();

  // Check bot connection status
  const checkBotConnection = async () => {
    try {
      const response = await fetch('/api/bot-settings/test-connection');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        setBotStatus(data.connected ? 'connected' : 'disconnected');
        return data.connected;
      }
    } catch (error) {
      console.error('Failed to check bot connection:', error);
      setIsConnected(false);
      setBotStatus('error');
    }
    return false;
  };

  // Send purchase notification to bot
  const sendPurchaseNotification = useMutation({
    mutationFn: async (purchaseData) => {
      const response = await fetch('/api/bot-settings/notify-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Purchase notification sent successfully:', data);
      
      // Show success message in Telegram
      if (telegramApp.isTelegram()) {
        telegramApp.showAlert('Purchase completed! You will receive the data shortly.');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries(['user-orders']);
      queryClient.invalidateQueries(['marketplace-entries']);
    },
    onError: (error) => {
      console.error('Failed to send purchase notification:', error);
      
      // Show error message in Telegram
      if (telegramApp.isTelegram()) {
        telegramApp.showAlert('Purchase completed but notification failed. Please contact support.');
      }
    }
  });

  // Send order status update
  const sendOrderUpdate = useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/bot-settings/notify-order-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send order update');
      }
      
      return response.json();
    }
  });

  // Send welcome message
  const sendWelcomeMessage = async (userData) => {
    try {
      const response = await fetch('/api/bot-settings/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        console.log('Welcome message sent successfully');
      }
    } catch (error) {
      console.error('Failed to send welcome message:', error);
    }
  };

  // Handle purchase completion
  const handlePurchaseComplete = async (purchaseData) => {
    const { orderId, userId, dataEntryId, paymentMethod, amount } = purchaseData;
    
    // Send notification to bot
    await sendPurchaseNotification.mutateAsync({
      orderId,
      userId,
      dataEntryId,
      paymentMethod,
      amount,
      timestamp: new Date().toISOString()
    });

    // Send data to Telegram bot if available
    if (telegramApp.isTelegram()) {
      telegramApp.sendData({
        type: 'purchase_completed',
        orderId,
        userId,
        dataEntryId,
        paymentMethod,
        amount
      });
    }
  };

  // Handle order status change
  const handleOrderStatusChange = async (orderData) => {
    const { orderId, userId, status, message } = orderData;
    
    // Send update to bot
    await sendOrderUpdate.mutateAsync({
      orderId,
      userId,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  };

  // Initialize bot integration
  useEffect(() => {
    const initializeBot = async () => {
      // Check bot connection on mount
      await checkBotConnection();
      
      // If user is available, send welcome message
      const user = telegramApp.getUser();
      if (user && isConnected) {
        await sendWelcomeMessage({
          userId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          languageCode: user.language_code
        });
      }
    };

    initializeBot();
  }, []);

  // Check connection periodically
  useEffect(() => {
    const interval = setInterval(checkBotConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    botStatus,
    checkBotConnection,
    sendPurchaseNotification,
    sendOrderUpdate,
    handlePurchaseComplete,
    handleOrderStatusChange,
    sendWelcomeMessage
  };
};

export default useTelegramBot;
