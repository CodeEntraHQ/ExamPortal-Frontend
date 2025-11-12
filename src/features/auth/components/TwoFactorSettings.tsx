import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Switch } from '../../../shared/components/ui/switch';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { Shield, Smartphone, CheckCircle2, AlertCircle, Loader2, Lock, Key } from 'lucide-react';
import { TwoFactorModal } from './TwoFactorModal';
import { QRCodeModal } from '../../../shared/components/common/QRCodeModal';
import { twoFactorAPI } from '../../../services/api';
import { useAuth } from '../providers/AuthProvider';

export function TwoFactorSettings() {
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  // 2FA data
  const [qrData, setQrData] = useState({ qrCode: '', manualCode: '' });

  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      // Enable 2FA flow
      await handleEnable2FA();
    } else {
      // Disable 2FA flow
      setShowDisableModal(true);
    }
  };

  const handleEnable2FA = async () => {
    setIsProcessing(true);
    try {
      const response = await twoFactorAPI.generate2FA();
      if (response.status === 'SUCCESS' && response.payload) {
        setQrData({
          qrCode: response.payload.qr_code,
          manualCode: response.payload.manual_code,
        });
        setShowQRModal(true);
      } else {
        throw new Error(response.message || 'Failed to generate 2FA setup data.');
      }
    } catch (err: any) {
        throw new Error('Failed to generate 2FA setup. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEnable = async (otp: string) => {
    // Verify OTP and enable 2FA
    const result = await twoFactorAPI.enable2FA(otp);
    
    if (result.status === 'SUCCESS') {
      setShowQRModal(false);
      setQrData({ qrCode: '', manualCode: '' });
      updateUser({ two_fa_enabled: true });
    }
  };

  const handleVerifyDisable = async (otp: string) => {
    // Verify OTP and disable 2FA
    const result = await twoFactorAPI.disable2FA(otp);
    
    if (result.status === 'SUCCESS') {
      setShowDisableModal(false);
      updateUser({ two_fa_enabled: false });
    }
  };

  const handleCancelSetup = () => {
    setShowQRModal(false);
    setQrData({ qrCode: '', manualCode: '' });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Alert */}
          {user?.two_fa_enabled  ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                Your account is protected with two-factor authentication. You'll need your authenticator app code when signing in.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Enable two-factor authentication to add an extra layer of security to your account. You'll need an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
              </AlertDescription>
            </Alert>
          )}
          {/* Main Toggle Section */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">Authenticator App</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.two_fa_enabled 
                  ? 'Two-factor authentication is currently enabled'
                  : 'Use an authenticator app to generate verification codes'}
              </p>
            </div>
            <Switch
              checked={user?.two_fa_enabled ?? false}
              onCheckedChange={handleToggle2FA}
              disabled={isProcessing}
            />
          </div>

        </CardContent>
      </Card>

      {/* QR Code Modal with integrated OTP verification */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={handleCancelSetup}
        onVerify={handleVerifyEnable}
        qrCode={qrData.qrCode}
        manualCode={qrData.manualCode}
      />

      {/* Verify Disable Modal */}
      <TwoFactorModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onVerify={handleVerifyDisable}
        title="Disable Two-Factor Authentication"
        description="Enter your authentication code to confirm disabling 2FA"
        showResend={false}
      />
    </>
  );
}
