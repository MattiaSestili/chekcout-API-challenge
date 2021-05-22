/**
 * Required External Modules and Interfaces
 */
import express, { Request, Response } from "express";
import * as ItemService from "./items.service";
import { Card, RequestCapture, ResponseCapture, ResponseRefund, Transaction } from "./item.interface";

/**
 * Router Definition
 */
export const itemsRouter = express.Router();

/**
 * Controller Definitions
 */

// POST items

itemsRouter.post("/authorize", async (req: Request, res: Response) => {
  try {
    const card: Card = req.body;
    // Here I am making an assumption as I am not familiar with 
    // valid card numbers the authorization failed can be done 
    // in two ways. Checking the all card number or
    // checking the last 4 digit using transaction.cardNumber.endsWith("0119")
    if (card.cardNumber === "4000 0000 0000 0119" || card.cardNumber === "4000000000000119") {
      throw new Error("authorization failure")
    }

    const createAuthorization = await ItemService.create(card);
    res.status(201).json(createAuthorization);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

itemsRouter.post("/capture", async (req: Request, res: Response) => {
  try {
    let result: ResponseCapture = {
      captureAmount: 0,
      currency: "",
      result: { errorMessage: "", result: "error" }
    };

    const request: RequestCapture = req.body

    // same here we can do both ways
    // checking the last 4 with transaction.cardNumber.endsWith("0259")
    const authorizedTransaction = await ItemService.find(request.authorizeID);
    if (authorizedTransaction?.cardNumber === "4000 0000 0000 0259") {
      throw new Error("capture failure")
    }

    const existingCaptures = await ItemService.findCapture(request.authorizeID);
    if (!!existingCaptures) {
      const refunds = await ItemService.findRefund(authorizedTransaction.authorizeID);

      // check if the request amount we are trying to capture is bigger than the authorize amount
      if (request.amount > (authorizedTransaction.amount - existingCaptures.captureAmount) || !!refunds) {
        result = {
          ...existingCaptures,
          result: { errorMessage: "Capture failed due to wrong request amount", result: "success" }
        }
      } else {
        const update = await ItemService.updateCapture(request.authorizeID, request.amount);
        result = {
          ...update,
          result: { errorMessage: "", result: "success" }
        }
      }

      return res.status(200).json(result);
    }

    const create = await ItemService.createCapture(request, authorizedTransaction?.currency);
    result = {
      ...create,
      result: { errorMessage: "", result: "success" }
    }

    res.status(201).json(result);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

itemsRouter.post("/refund", async (req: Request, res: Response) => {
  try {
    let result: ResponseRefund = {
      amount: 0,
      result: { errorMessage: "", result: "error" }
    }

    const request: RequestCapture = req.body;
    const storedCapture = await ItemService.findCapture(request.authorizeID);
    const authorizedTransaction = await ItemService.find(request.authorizeID);

    if (authorizedTransaction?.cardNumber === "4000 0000 0000 3238") {
      throw new Error("refund failure")
    }

    if (!storedCapture) {
      result = {
        amount: 0,
        result: { errorMessage: "no captures were found", result: "error" }
      }
      res.status(200).json(result);
      return
    }

    const refund = await ItemService.addRefund(request.authorizeID, storedCapture.captureAmount);
    if (!!refund) {
      result = {
        amount: refund.amount,
        result: { errorMessage: "", result: "success" }
      }
    }
    res.status(200).json(result);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// DELETE items/:id

itemsRouter.delete("/void/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const transaction = await ItemService.find(id);
    if (!(await ItemService.remove(transaction, id))) {
      throw new Error("Error occurred. Transaction not voided")
    }

    res.sendStatus(204).json("Transaction has been canceled");
  } catch (e) {
    res.status(500).send(e.message);
  }
});
