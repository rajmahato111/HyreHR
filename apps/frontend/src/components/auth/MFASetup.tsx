import React, { useState } from 'react';
import axios from 'axios';

interface MFASetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface MFASetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/mfa/setup');
      setSetupData(response.data);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/auth/mfa/enable', {
        token: verificationCode,
      });
      setStep('backup');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;
    
    const content = `Recruiting Platform - MFA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${setupData.backupCodes.join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'setup') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Enable Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-6">
          Two-factor authentication adds an extra layer of security to your account.
          You'll need to enter a code from your authenticator app each time you log in.
        </p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>An authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Your mobile device</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSetup}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify' && setupData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Scan this QR code with your authenticator app:
            </p>
            <img 
              src={setupData.qrCode} 
              alt="MFA QR Code" 
              className="mx-auto border rounded p-2"
            />
          </div>

          <div className="bg-gray-50 border rounded p-4">
            <p className="text-sm text-gray-600 mb-2">Or enter this code manually:</p>
            <code className="block text-center font-mono text-sm bg-white p-2 rounded border">
              {setupData.secret}
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter the 6-digit code from your app:
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-2 border rounded text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'backup' && setupData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Save Backup Codes</h2>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-900 font-semibold mb-2">⚠️ Important!</p>
            <p className="text-yellow-800 text-sm">
              Save these backup codes in a safe place. You can use them to access your account
              if you lose access to your authenticator app. Each code can only be used once.
            </p>
          </div>

          <div className="bg-gray-50 border rounded p-4">
            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <code key={index} className="block text-center font-mono text-sm bg-white p-2 rounded border">
                  {code}
                </code>
              ))}
            </div>
          </div>

          <button
            onClick={downloadBackupCodes}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            📥 Download Backup Codes
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleComplete}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              I've Saved My Codes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
