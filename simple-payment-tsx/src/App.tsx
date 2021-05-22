import React, { useState } from 'react';
import { Form, Col, Button, Row, Container } from "react-bootstrap"
import './App.css';

interface Card {
  holderName: string;
  cardNumber: string
  amount: number;
  currency: string;
  expiryDate: string;
  cvv: number;
}

interface Transaction extends Card {
  authorizeID: string;
}

export interface ResultTransaction {
  result: "success" | "error";
  errorMessage: string;
}

interface ResponseCapture {
  result: ResultTransaction;
  captureAmount: number;
  currency: string;
}

function App() {
  const [transaction, setTransaction] = useState<Card>({
    amount: 0,
    cardNumber: "",
    currency: "GBP",
    cvv: 0,
    expiryDate: "",
    holderName: ""
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.type === "number") {
      setTransaction({ ...transaction, [e.currentTarget.name]: isNaN(e.currentTarget.valueAsNumber) ? 0 : e.currentTarget.valueAsNumber })
    } else {
      setTransaction({ ...transaction, [e.currentTarget.name]: e.currentTarget.value })
    }
  }

  const authorizedTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:7000/api/gateway/authorize", {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error(await response.text())
      }

      // success 
      const authorizedTransaction: Transaction = await response.json()
      console.log(authorizedTransaction)

      const responseCapt = await fetch("http://localhost:7000/api/gateway/capture", {
        method: "POST",
        body: JSON.stringify({
          authorizeID: authorizedTransaction.authorizeID,
          amount: 100
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!responseCapt.ok) {
        throw new Error(await responseCapt.text())
      }

      const captured: ResponseCapture = await responseCapt.json();
      console.log(captured);

      const responseRefund = await fetch("http://localhost:7000/api/gateway/refund", {
        method: "POST",
        body: JSON.stringify({
          authorizeID: authorizedTransaction.authorizeID,
          amount: captured.captureAmount
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!responseRefund.ok) {
        throw new Error(await responseRefund.text())
      }

      console.log(await responseRefund.json())

    } catch (error) {
      console.log(error);
    }
  }

  // TODO add logic to process capture / multiple captures, void and or refunds
  // useEffect(() => {
  //   return () => {}
  // }, []);

  return (
    <div className="App">
      <Container fluid>
        <Row style={{ marginTop: "5rem" }}>
          <Col sm={6} xs={12}>
            <Form onSubmit={authorizedTransaction}>
              <Form.Group>
                <Form.Label>Card holder name</Form.Label>
                <Form.Control type="text" name={"holderName"} value={transaction?.holderName} required={true} placeholder="Enter holder's full name" onChange={onChange} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Card number</Form.Label>
                <Form.Control type="text" required={true} name={"cardNumber"} value={transaction?.cardNumber} placeholder="Enter valid card number" onChange={onChange} />
              </Form.Group>

              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Expire date</Form.Label>
                  <Form.Control type="text" required={true} name={"expiryDate"} value={transaction?.expiryDate} onChange={onChange} />
                </Form.Group>

                <Form.Group as={Col}>
                  <Form.Label>CVV</Form.Label>
                  <Form.Control type="number" required={true} placeholder="Enter card's CVV" name={"cvv"} value={transaction?.cvv} onChange={onChange} />
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control type="number" required={true} name={"amount"} value={transaction?.amount} onChange={onChange} />
                </Form.Group>

                {/* <Form.Group as={Col}>
                  <Form.Label>currency</Form.Label>
                  <Form.Control type="text" required={true} placeholder="Enter card's CVV" name={"currency"} value={transaction?.currency} onChange={onChange} />
                </Form.Group> */}
              </Form.Row>

              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
