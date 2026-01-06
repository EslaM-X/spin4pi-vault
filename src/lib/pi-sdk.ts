// Pi Network SDK v2.0 Integration
// https://pi-apps.github.io/community-developer-guide/docs/gettingStarted/piAppPlatform/piAppPlatformSDK/

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: PaymentDTO) => void
      ) => Promise<AuthResult>;
      createPayment: (
        paymentData: PaymentData,
        callbacks: PaymentCallbacks
      ) => Promise<PaymentDTO>;
      openShareDialog: (title: string, message: string) => void;
    };
  }
}

export interface AuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

export interface PaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  from_address: string;
  to_address: string;
  direction: string;
  created_at: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: {
    txid: string;
    verified: boolean;
    _link: string;
  } | null;
}

export interface PaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

export interface PaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PaymentDTO) => void;
}

class PiNetworkSDK {
  private initialized = false;
  private sdkLoaded = false;

  async loadSDK(): Promise<boolean> {
    if (this.sdkLoaded) return true;
    
    return new Promise((resolve) => {
      // Check if SDK is already loaded
      if (window.Pi) {
        this.sdkLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      
      script.onload = () => {
        this.sdkLoaded = true;
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Pi Network SDK');
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  }

  async init(sandbox = false): Promise<boolean> {
    if (this.initialized) return true;
    
    const loaded = await this.loadSDK();
    if (!loaded || !window.Pi) {
      console.error('Pi SDK not available');
      return false;
    }

    try {
      window.Pi.init({ version: '2.0', sandbox });
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Pi SDK:', error);
      return false;
    }
  }

  async authenticate(
    onIncompletePaymentFound?: (payment: PaymentDTO) => Promise<void>
  ): Promise<AuthResult | null> {
    if (!window.Pi) {
      console.error('Pi SDK not initialized');
      return null;
    }

    try {
      const scopes = ['username', 'payments'];
      const authResult = await window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound || (async () => {})
      );
      return authResult;
    } catch (error) {
      console.error('Pi authentication failed:', error);
      return null;
    }
  }

  async createPayment(
    amount: number,
    memo: string,
    metadata: Record<string, unknown>,
    callbacks: PaymentCallbacks
  ): Promise<PaymentDTO | null> {
    if (!window.Pi) {
      console.error('Pi SDK not initialized');
      return null;
    }

    try {
      const paymentData: PaymentData = {
        amount,
        memo,
        metadata,
      };
      
      const payment = await window.Pi.createPayment(paymentData, callbacks);
      return payment;
    } catch (error) {
      console.error('Pi payment creation failed:', error);
      return null;
    }
  }

  shareDialog(title: string, message: string): void {
    if (!window.Pi) {
      console.error('Pi SDK not initialized');
      return;
    }
    window.Pi.openShareDialog(title, message);
  }

  isAvailable(): boolean {
    return !!window.Pi;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const piSDK = new PiNetworkSDK();
