import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Shield, UserCheck, FileText } from 'lucide-react';

const UserAgreement = ({ onAgreementComplete, userData }) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [error, setError] = useState(null);

  const termsAndConditions = `
    TERMS AND CONDITIONS OF USE

    1. ACCEPTANCE OF TERMS
    By accessing and using this Telegram Mini App ("the App"), you accept and agree to be bound by the terms and provision of this agreement.

    2. USER CONDUCT
    - You agree to use the App only for lawful purposes
    - You will not attempt to gain unauthorized access to any part of the App
    - You will not interfere with or disrupt the App's operation
    - You will not use the App to transmit harmful, offensive, or inappropriate content

    3. PRIVACY AND DATA
    - We collect and process your data in accordance with our Privacy Policy
    - Your personal information will be used to provide services and improve user experience
    - We implement appropriate security measures to protect your data

    4. INTELLECTUAL PROPERTY
    - The App and its content are protected by copyright and other intellectual property laws
    - You may not copy, modify, or distribute any content without permission

    5. DISCLAIMER
    - The App is provided "as is" without warranties of any kind
    - We are not responsible for any damages arising from your use of the App

    6. LIMITATION OF LIABILITY
    - Our liability is limited to the maximum extent permitted by law
    - We are not liable for indirect, incidental, or consequential damages

    7. MODIFICATIONS
    - We reserve the right to modify these terms at any time
    - Continued use of the App constitutes acceptance of modified terms

    8. GOVERNING LAW
    - These terms are governed by applicable laws
    - Any disputes will be resolved through appropriate legal channels

    By agreeing to these terms, you acknowledge that you have read, understood, and agree to be bound by all provisions.
  `;

  const handleAgreement = async () => {
    if (!hasReadTerms || !hasAgreed) {
      setError('You must read and agree to the terms before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send agreement to backend and generate credentials
      const response = await fetch('/api/user-agreement/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData?.id,
          firstName: userData?.first_name,
          lastName: userData?.last_name,
          username: userData?.username,
          languageCode: userData?.language_code,
          agreedAt: new Date().toISOString(),
          ipAddress: 'telegram-mini-app', // Since we can't get real IP in TMA
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedCredentials(result.credentials);
        
        // Call the completion handler with credentials
        onAgreementComplete(result.credentials);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process agreement');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = (type) => {
    const text = type === 'username' ? generatedCredentials.username : generatedCredentials.password;
    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
      const button = document.getElementById(`copy-${type}`);
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
      }, 2000);
    });
  };

  if (generatedCredentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#001826] via-[#001A2E] to-[#001826] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome! 🎉</h2>
            <p className="text-white/70">Your account has been created successfully</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Login Credentials</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Username</label>
                <div className="flex">
                  <input
                    type="text"
                    value={generatedCredentials.username}
                    readOnly
                    className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-white"
                  />
                  <button
                    id="copy-username"
                    onClick={() => handleCopyCredentials('username')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">Password</label>
                <div className="flex">
                  <input
                    type="password"
                    value={generatedCredentials.password}
                    readOnly
                    className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-3 py-2 text-white"
                  />
                  <button
                    id="copy-password"
                    onClick={() => handleCopyCredentials('password')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium mb-1">Important:</p>
                <p>Save these credentials securely. You'll need them to access the marketplace.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/marketplace'}
            className="w-full bg-[#D6FF57] text-[#001826] font-semibold py-3 px-6 rounded-xl hover:bg-[#C4F94E] transition-colors"
          >
            Continue to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001826] via-[#001A2E] to-[#001826] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Data Shop</h1>
          <p className="text-white/70">Please read and agree to our terms before continuing</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Terms and Conditions</h2>
          </div>
          
          <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
              {termsAndConditions}
            </pre>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReadTerms}
              onChange={(e) => setHasReadTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-white/90">
              I have read and understood the Terms and Conditions above
            </span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-white/90">
              I agree to be bound by these Terms and Conditions
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => window.Telegram?.WebApp?.close()}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/20 transition-colors"
          >
            Decline & Exit
          </button>
          
          <button
            onClick={handleAgreement}
            disabled={!hasReadTerms || !hasAgreed || isSubmitting}
            className="flex-1 bg-[#D6FF57] text-[#001826] font-semibold py-3 px-6 rounded-xl hover:bg-[#C4F94E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#001826] border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>I Agree & Continue</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/50">
            By agreeing, you consent to our data processing practices and acknowledge that you have read our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
