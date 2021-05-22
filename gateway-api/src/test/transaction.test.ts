import { expect } from 'chai';
import 'mocha';
import { Card } from '../items/item.interface';
import { authorize, capture, findCapture, refund } from '../items/items.service';

describe('transaction', () => {
  it('return a success for an authorization', async () => {
    const card: Card = {
      amount: 10,
      cardNumber: "4000 0000 0000 233",
      currency: "GBP",
      cvv: 221,
      expiryDate: "12/10",
      holderName: "john smith"
    }
    
    const create = await authorize(card);
    expect(create.result).to.equal("success");
  });
});

describe("capture and refund flow", () => {
  it("should return a capture payment for an authorize transaction", async () => {
    const result = await capture({amount: 5, authorizeID: "1"});
    expect(result.captureAmount).to.equal(5);
  })

  it("should call capture and update amount with the same id", async () => {
    const result = await capture({ amount: 5, authorizeID: "1" });
    expect(result.captureAmount).to.equal(10);
  })

  it("should return a message error if the amount it is trying to capture is bigger than the authorized one", async () => {
    const cap = await capture({ amount: 6, authorizeID: "1" });
    expect(cap.result.result).to.equal("error");
  })

  it("should return an error for a capture refund", async () => {
    const ref = await refund({ amount: 15, authorizeID: "1" });
    expect(ref.result.result).to.equal("error");
  })

  it("should return a new capture payment", async () => {
    const result = await capture({ amount: 5, authorizeID: "2" });
    expect(result.captureAmount).to.equal(5);
  });

  it("should return success for another capture refund", async () => {
    const ref = await refund({ amount: 5, authorizeID: "1" });
    expect(ref.result.result).to.equal("success");
  });

  it("should return success for a capture refund", async () => {
    const ref = await refund({ amount: 5, authorizeID: "1" });
    expect(ref.result.result).to.equal("success");
  })

  it("should return an error trying to capture a refunded id", async () => {
    const ref = await capture({ amount: 5, authorizeID: "1" });
    expect(ref.result.errorMessage).to.equal("Error a capture is not allowed for a transaction refunded");
  });
});


