import React, { useState } from 'react';
import axios from 'axios';

interface MFAVerificationProps {
  userId: string;
  onSuccess: (tokens: { accessToken: string; refreshToken: string }) => void;
  onCancel: () => void;
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({ 
  userId, 
  onSuccess, 
  onCancel 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    if (!code || (useBackupCode ? code.length !== 8 : code.length !== 6)) {
      setError(`Please enter a valid ${useBackupCode ? '8-character backup code' : '6-digit code'}`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/mfa/verify', {
        userId,
        token: code,
      });
      
      onSuccess({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length >= 6) {
      handleVerify();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          {useBackupCode 
            ? 'Enter one of your backup codes to continue.'
            : 'Enter the 6-digit code from your authenticator app to continue.'}
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {useBackupCode ? 'Backup Code' : 'Verification Code'}
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = useBackupCode 
                ? e.target.value.toUpperCase().slice(0, 8)
                : e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
            }}
            onKeyPress={handleKeyPress}
            placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
            className="w-full px-4 py-2 border rounded text-center text-2xl tracking-widest"
            maxLength={useBackupCode ? 8 : 6}
            autoFocus
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
            disabled={loading || code.length < (useBackupCode ? 8 : 6)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setError('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {useBackupCode 
              ? 'Use authenticator app instead' 
              : 'Use backup code instead'}
          </button>
        </div>
      </div>
    </div>
  );
};
