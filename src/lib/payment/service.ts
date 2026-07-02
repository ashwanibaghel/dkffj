import { PhonePeGateway } from "./phonepe";

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

export class PaymentService {
  private gateway: PaymentGateway;

  constructor(gateway?: PaymentGateway) {
    this.gateway = gateway || new PhonePeGateway();
  }

  async processPayment(details: PaymentDetails): Promise<string> {
    return this.gateway.createOrder(details);
  }

  async verify(transactionId: string, payload: any): Promise<PaymentResponse> {
    return this.gateway.verifyPayment(transactionId, payload);
  }
}

export const paymentServiceInstance = new PaymentService();
