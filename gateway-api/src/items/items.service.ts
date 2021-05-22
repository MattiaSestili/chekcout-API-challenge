import { v4 as uuidv4, parse as uuidParse } from 'uuid';

/**
 * Data Model Interfaces
 */
import { Card, Transaction, Capture, RequestCapture, Refund } from "./item.interface";
import { Transactions, Captures, Refunds } from "./items.interface";

/**
 * In-Memory Store
 */

let refunds: Refunds = {};

let captures: Captures = {
  "1": {
    captureAmount: 100,
    currency: "GBP"
  }
}

let transactions: Transactions = {
  "1": {
    authorizeID: "1",
    amount: 200,
    cardNumber: "4000 0000 0000 0119",
    currency: "GBP",
    cvv: 223,
    expiryDate: "22/10",
    holderName: "John Smith"
  }
};


/**
 * Service Methods
 */
export const findAll = async (): Promise<Transaction[]> => Object.values(transactions);

export const find = async (id: string): Promise<Transaction> => transactions[id];

export const findCapture = async (id: string): Promise<Capture> => captures[id];

export const findRefund = async (id: string): Promise<Refund> => refunds[id];

export const create = async (trans: Card): Promise<Transaction> => {
  const authorizeId = uuidv4();
  transactions[authorizeId] = {
    authorizeID: authorizeId,
    ...trans
  }

  return transactions[authorizeId];
};

export const createCapture = async (capture: RequestCapture, currency: string): Promise<Capture> => {
  const id = capture.authorizeID;
  captures[id] = {
    captureAmount: capture.amount,
    currency: currency
  }

  return captures[id];
}

export const updateCapture = async (authorizeId: string, amount: number): Promise<Capture> => {
  captures[authorizeId] = { ...captures[authorizeId], captureAmount: amount };
  return captures[authorizeId];
}

export const remove = async (transaction: Transaction, id: string): Promise<null | void> => {
  if (!transaction) {
    return null;
  }

  delete transactions[id];
};

export const addRefund = async (authorizedId: string, amount: number): Promise<Refund> => {
  const id = authorizedId;
  refunds[id] = {
    amount: amount
  }

  return refunds[id];
}