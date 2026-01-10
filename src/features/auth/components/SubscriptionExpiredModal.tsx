import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { motion } from 'motion/react';
import { AlertCircle, Clock, Mail, Phone, XCircle } from 'lucide-react';

interface SubscriptionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionExpiredModal({ isOpen, onClose }: SubscriptionExpiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-4 rounded-full bg-destructive/10">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
          </motion.div>
          <DialogTitle className="text-center text-2xl">
            Subscription Expired
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Your subscription period has ended
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-medium">
              Access to the platform has been temporarily suspended due to an expired subscription.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm text-foreground mb-3">What happens next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>Your account has been automatically deactivated</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>You will need to renew your subscription to regain access</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>All your data and settings will be preserved</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Need Help?
            </div>
            <p className="text-sm text-muted-foreground">
              Please contact your system administrator or support team to renew your subscription and restore access.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email: support@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Phone: +1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
