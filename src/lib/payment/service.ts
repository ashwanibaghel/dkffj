export interface PaymentDetails {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerMobile: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  gatewayName: string;
  amount: number;
  rawResponse: any;
}

export interface PaymentGateway {
  createOrder(details: PaymentDetails): Promise<string>;
  verifyPayment(transactionId: string, payload: any): Promise<PaymentResponse>;
}

export class MockPaymentGateway implements PaymentGateway {
  async createOrder(details: PaymentDetails): Promise<string> {
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = "http://localhost:3000";
      }
    }
    return `${baseUrl}/payment-mock?orderId=${details.orderId}&amount=${details.amount}&email=${encodeURIComponent(details.customerEmail)}&mobile=${details.customerMobile}`;
  }

  async verifyPayment(transactionId: string, payload: any): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId: transactionId || "TXN-" + Math.random().toString(36).substring(2, 11).toUpperCase(),
      gatewayName: "MOCK_PAYMENT",
      amount: payload.amount || 0,
      rawResponse: { status: "success", timestamp: new Date().toISOString() },
    };
  }
}

export class PaymentService {
  private gateway: PaymentGateway;

  constructor(gateway?: PaymentGateway) {
    this.gateway = gateway || new MockPaymentGateway();
  }

  async processPayment(details: PaymentDetails): Promise<string> {
    return this.gateway.createOrder(details);
  }

  async verify(transactionId: string, payload: any): Promise<PaymentResponse> {
    return this.gateway.verifyPayment(transactionId, payload);
  }
}

export const paymentServiceInstance = new PaymentService();
