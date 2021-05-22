import { v4 as uuidv4, parse as uuidParse } from 'uuid';

/**
 * Data Model Interfaces
 */
import { Card, Transaction, Capture, RequestCapture, Refund, ResponseRefund, ResponseCapture, ResultTransaction } from "./item.interface";
import { Transactions, Captures, Refunds } from "./items.interface";

/**
 * In-Memory Store
 */

let refunds: Refunds = {
  "3": {
    amount: 5
  }
};

let captures: Captures = {
  "10": {
    captureAmount: 6,
    currency: "GBP"
  }
}

let transactions: Transactions = {
  "1": {
    authorizeID: "1",
    amount: 10,
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

export const add = async (c: Card): Promise<Transaction> => {
  const authorizeId = uuidv4();
  transactions[authorizeId] = {
    authorizeID: authorizeId,
    ...c
  }

  return transactions[authorizeId];
};

export const authorize = async (c: Card): Promise<ResultTransaction> => {
  let result: ResultTransaction = {
    errorMessage: "",
    result: "error"
  }

  const addTransaction = add(c);
  if (!!addTransaction) {
    return result = {
      errorMessage: "",
      result: "success"
    }
  }

  return result;
}

export const remove = async (transaction: Transaction, id: string): Promise<null | void> => {
  if (!transaction) {
    return null;
  }

  delete transactions[id];
};

export const capture = async (request: RequestCapture): Promise<ResponseCapture> => {
  let result: ResponseCapture = {
    captureAmount: 0,
    currency: "",
    result: { errorMessage: "", result: "error" }
  };

  // same here we can do both ways
  // checking the last 4 with transaction.cardNumber.endsWith("0259")
  const authorizedTransaction = await find(request.authorizeID);
  if (authorizedTransaction?.cardNumber === "4000 0000 0000 0259") {
    throw new Error("capture failure")
  }

  const existingCaptures = await findCapture(request.authorizeID);
  if (!!existingCaptures) {
    const refunds = await findRefund(request.authorizeID);

    // check if the request amount we are trying to capture is bigger than the authorize amount
    // or its been refunded
    if (request.amount > (authorizedTransaction.amount - existingCaptures.captureAmount) || !!refunds?.amount) {
      const message = !!refunds?.amount ? "Error a capture is not allowed for a transaction refunded" : "Capture failed due to wrong request amount"
      return result = {
        ...existingCaptures,
        result: { errorMessage: message, result: "error" }
      }
    } else {
      const update = await updateCapture(request.authorizeID, request.amount);
      return result = {
        ...update,
        result: { errorMessage: "", result: "success" }
      }
    }
  }

  const create = await createCapture(request, authorizedTransaction?.currency);
  result = {
    ...create,
    result: { errorMessage: "", result: "success" }
  }

  return result;
}

export const refund = async (request: RequestCapture): Promise<ResponseRefund> => {
  let result: ResponseRefund = {
    amount: 0,
    result: { errorMessage: "", result: "error" }
  }

  try {
    const storedCapture = await findCapture(request.authorizeID);
    const authorizedTransaction = await find(request.authorizeID);

    if (authorizedTransaction?.cardNumber === "4000 0000 0000 3238") {
      throw new Error("refund failure")
    }

    if (!storedCapture) {
      return result = {
        amount: 0,
        result: { errorMessage: "no captures were found", result: "error" }
      }
    }

    if (storedCapture.captureAmount >= request.amount) {
      const refund = await addRefund(request.authorizeID, storedCapture.captureAmount);
      if (!!refund) {
        return result = {
          amount: refund.amount,
          result: { errorMessage: "", result: "success" }
        }
      }
    }

    return result = {
      amount: 0,
      result: { errorMessage: "refund could not be executed. Wrong requested amount", result: "error" }
    };

  } catch (error) {
    // TODO add logging to write on log file
    console.log(error);
  }

  return result;
}

export const addRefund = async (authorizedId: string, amount: number): Promise<Refund> => {
  const id = authorizedId;
  refunds[id] = {
    amount: amount
  }

  return refunds[id];
}

export const createCapture = async (capture: RequestCapture, currency: string): Promise<Capture> => {
  const id = capture.authorizeID;
  captures[id] = {
    captureAmount: capture.amount,
    currency: currency
  }

  return captures[id];
}

export const updateCapture = async (authorizeId: string, amount: number): Promise<Capture> => {
  captures[authorizeId] = {
    ...captures[authorizeId],
    captureAmount: captures[authorizeId].captureAmount + amount
  };
  return captures[authorizeId];
}