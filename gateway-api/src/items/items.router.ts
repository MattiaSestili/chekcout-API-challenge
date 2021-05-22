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

    const createAuthorization = await ItemService.authorize(card);
    res.status(201).json(createAuthorization);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

itemsRouter.post("/capture", async (req: Request, res: Response) => {
  try {
    const request: RequestCapture = req.body
    const result = await ItemService.capture(request);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

itemsRouter.post("/refund", async (req: Request, res: Response) => {
  try {
    const request: RequestCapture = req.body;
    const result = await ItemService.refund(request)
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
