import { Capture, Refund, Transaction } from "./item.interface";

export interface Transactions {
  [key: string]: Transaction;
}

export interface Captures {
  [key: string]: Capture;
}

export interface Refunds {
  [key: string]: Refund;
}