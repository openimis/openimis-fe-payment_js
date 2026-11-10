import { describe, expect, it, vi } from "vitest";

// Only fe-core's dispatcher is stubbed; the formatters are real, imported from their
// defining modules because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
}));

vi.mock("@openimis/fe-core", async () => ({
  ...(await vi.importActual("@openimis/fe-core/helpers/api")),
  ...(await vi.importActual("@openimis/fe-core/actions")),
  ...core,
}));

const actions = await import("./actions");

const mm = { getProjection: () => "{id}" };
const query = (result) => result.payload.replace(/\s+/g, " ");

describe("payment actions", () => {
  describe("queries", () => {
    it.each([
      ["fetchPremiumsPayments", "paymentsByPremiums", "PAYMENT_PREMIUMS_PAYMENTS"],
      ["fetchPaymentsSummaries", "payments", "PAYMENT_PAYMENTS"],
    ])("%s asks for a counted page of payment summaries", (creator, entity, type) => {
      const result = actions[creator](mm, ['premiumUuid: "prem-1"', "first: 10"]);

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(premiumUuid: "prem-1",first: 10) { totalCount`);
      expect(query(result)).toContain("expectedAmount,receivedDate,receivedAmount,status,receiptNo,typeOfPayment");
      expect(query(result)).not.toContain("transferFee");
    });

    it("looks a payment up by uuid, with the full projection", () => {
      const result = actions.fetchPayment(mm, "pay-1", "cmid-1");

      expect(result.type).toBe("PAYMENT_OVERVIEW");
      expect(query(result)).toContain('payments(uuid: "pay-1")');
      expect(query(result)).toContain("transferFee");
      expect(query(result)).not.toContain("totalCount");
    });

    it("falls back to the mutation that created the payment", () => {
      expect(query(actions.fetchPayment(mm, null, "cmid-1"))).toContain('payments(clientMutationId: "cmid-1")');
    });

    it.each([
      ["fetchPaymentInvoices", "paymentInvoice", "PAYMENTINVOICE__PAYMENT_INVOICE", "payerRef"],
      ["fetchDetailPaymentInvoices", "detailPaymentInvoice", "PAYMENTINVOICE__DETAIL_PAYMENT_INVOICE", "reconciliationId"],
    ])("%s asks for a counted page of its entity", (creator, entity, type, field) => {
      const result = actions[creator](["first: 10"]);

      expect(result.type).toBe(type);
      expect(query(result)).toContain(`${entity}(first: 10) { totalCount`);
      expect(query(result)).toContain(field);
    });

    it("starts a new payment", () => {
      const dispatch = vi.fn();

      actions.newPayment()(dispatch);

      expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type: "PAYMENT_NEW" });
    });
  });

  describe("payment input", () => {
    const payment = {
      uuid: "pay-1",
      requestDate: "2026-01-01",
      receivedDate: "2026-01-02",
      matchedDate: "2026-01-03",
      dateLastSms: "2026-01-04",
      expectedAmount: 100,
      receivedAmount: "99.50",
      transferFee: 0.5,
      status: -1,
      receiptNo: "R-1",
      typeOfPayment: "C",
      officerCode: "E00001",
      origin: "Bank",
      rejectedReason: "Wrong amount",
      premium_uuid: "prem-1",
    };
    const sent = (value) => actions.formatPaymentGQL(mm, value).replace(/\s+/g, " ");

    it("sends the amounts as decimal strings and the status as a bare integer", () => {
      const gql = sent(payment);

      expect(gql).toContain('expectedAmount: "100"');
      expect(gql).toContain('receivedAmount: "99.50"');
      expect(gql).toContain('transferFee: "0.5"');
      expect(gql).toContain("status: -1");
    });

    it("sends the dates, codes and the contribution it pays", () => {
      const gql = sent(payment);

      expect(gql).toContain('uuid: "pay-1"');
      expect(gql).toContain('requestDate: "2026-01-01"');
      expect(gql).toContain('receivedDate: "2026-01-02"');
      expect(gql).toContain('matchedDate: "2026-01-03"');
      expect(gql).toContain('dateLastSms: "2026-01-04"');
      expect(gql).toContain('receiptNo: "R-1"');
      expect(gql).toContain('typeOfPayment: "C"');
      expect(gql).toContain('officerCode: "E00001"');
      expect(gql).toContain('origin: "Bank"');
      expect(gql).toContain('rejectedReason: "Wrong amount"');
      expect(gql).toContain('premiumUuid: "prem-1"');
    });

    it("escapes the free-text fields", () => {
      const gql = sent({ receiptNo: "R\n1", origin: "Tab\there" });

      expect(gql).toContain('receiptNo: "R\\n1"');
      expect(gql).toContain('origin: "Tab\\there"');
    });

    it("omits the fields that were never filled in", () => {
      expect(sent({ typeOfPayment: "C" }).trim()).toBe('typeOfPayment: "C"');
    });

    // Currently fails: every amount is gated on truthiness, so 0 is left out. The backend
    // resets all fields before applying an update, so a zero is saved as empty.
    it.fails.each([["expectedAmount"], ["receivedAmount"], ["transferFee"]])("sends a zero %s", (field) => {
      expect(sent({ uuid: "pay-1", [field]: 0 })).toContain(`${field}: "0"`);
    });

    // Currently fails: these fields are loaded with the payment but never sent back, and
    // the backend clears every field before an update — so saving a payment in
    // the form erases the phone number, transaction number and language it came with.
    it.fails("carries the loaded phone number, transaction number and language through an update", () => {
      const gql = sent({ uuid: "pay-1", phoneNumber: "+255700000000", transactionNo: "TX-1", languageName: "en" });

      expect(gql).toContain('phoneNumber: "+255700000000"');
      expect(gql).toContain('transactionNo: "TX-1"');
      expect(gql).toContain('languageName: "en"');
    });
  });

  describe("payment mutations", () => {
    it.each([
      ["createPayment", "PAYMENT_CREATE_RESP"],
      ["updatePayment", "PAYMENT_UPDATE_RESP"],
      ["deletePayment", "PAYMENT_DELETE_RESP"],
    ])("%s raises the request, its own success and the shared error type", (creator, success) => {
      const result = actions[creator](mm, { uuid: "pay-1", typeOfPayment: "C" }, "label");

      expect(result.type).toEqual(["PAYMENT_MUTATION_REQ", success, "PAYMENT_MUTATION_ERR"]);
      expect(query(result)).toContain(`mutation ${creator}`);
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(result.meta.clientMutationLabel).toBe("label");
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it.each([["updatePayment"], ["deletePayment"]])("%s remembers which payment it changed", (creator) => {
      expect(actions[creator](mm, { uuid: "pay-1" }, "label").meta.paymentUuid).toBe("pay-1");
    });

    it("sends the payment fields when saving", () => {
      const sent = query(actions.updatePayment(mm, { uuid: "pay-1", receivedAmount: 10 }, "label"));

      expect(sent).toContain('uuid: "pay-1"');
      expect(sent).toContain('receivedAmount: "10"');
    });

    it("addresses a deletion by a list of uuids and locks the row it was given", () => {
      const row = { uuid: "pay-1" };
      const result = actions.deletePayment(mm, row, "label");

      expect(query(result)).toContain('uuids: ["pay-1"]');
      expect(row.clientMutationId).toBe(result.meta.clientMutationId);
    });
  });
});
