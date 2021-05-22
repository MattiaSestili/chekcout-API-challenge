export interface Card {
  holderName: string;
  cardNumber: string
  amount: number;
  currency: string;
  expiryDate: string;
  cvv: number;
}

export interface Transaction extends Card {
  authorizeID: string;
}

export interface Capture {
  captureAmount: number;
  currency: string;
}

export interface Refund {
  amount: number;
}

export interface ResultTransaction {
  result: "success" | "error";
  errorMessage: string;
} 

export interface RequestCapture {
  authorizeID: string;
  amount: number;
}

export interface ResponseCapture extends Capture {
  result: ResultTransaction;
}

export interface ResponseRefund extends Refund {
  result: ResultTransaction;
}

