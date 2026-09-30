import { describe, expect, it, vi } from "vitest";

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock("@openimis/fe-core", async () => vi.importActual("@openimis/fe-core/helpers/api"));

const { default: reducer } = await import("./reducer");
const { graphqlErrors, relayPage, serverError } = await import("@openimis/fe-core/testing");

const initial = () => reducer(undefined, { type: "@@INIT" });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, type, data) => dispatch(state, `${type}_RESP`, { payload: { data } });
const fail = (state, type, payload = serverError(500, "Internal Server Error", "boom")) =>
  dispatch(state, `${type}_ERR`, { payload });

const SERVER_ERROR = { code: 500, message: "Internal Server Error", detail: "boom" };

describe("payment reducer", () => {
  describe("initialisation", () => {
    it("starts with nothing loaded and nothing in flight", () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.premiumsPayments).toBeNull();
      expect(state.payments).toEqual([]);
      expect(state.payment).toBeNull();
      expect(state.paymentsPageInfo).toEqual({ totalCount: 0 });
    });

    it("returns the same state object for an unrelated action", () => {
      const state = initial();

      expect(reducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
  });

  describe("payments of the selected contribution", () => {
    const loaded = () => ({
      ...initial(),
      premiumsPayments: [{ uuid: "pay-1" }],
      premiumsPaymentsPageInfo: { totalCount: 1 },
      fetchedPremiumsPayments: true,
    });

    it.each([
      ["POLICY_INSUREE_POLICIES_REQ"],
      ["POLICY_FAMILY_POLICIES_REQ"],
      ["CONTRIBUTION_POLICES_PREMIUMS_REQ"],
      ["PAYMENT_PREMIUMS_PAYMENTS_REQ"],
    ])("drops the list when %s starts", (type) => {
      expect(dispatch(loaded(), type)).toMatchObject({
        premiumsPayments: null,
        premiumsPaymentsPageInfo: { totalCount: 0 },
        fetchedPremiumsPayments: false,
        fetchingPremiumsPayments: true,
        errorPremiumsPayments: null,
      });
    });

    it("drops the list without claiming a fetch when a different family is opened", () => {
      expect(dispatch(loaded(), "INSUREE_FAMILY_OVERVIEW_REQ")).toMatchObject({
        premiumsPayments: null,
        fetchedPremiumsPayments: false,
        fetchingPremiumsPayments: false,
      });
    });

    it("stores the page as returned", () => {
      const state = respond(initial(), "PAYMENT_PREMIUMS_PAYMENTS", {
        paymentsByPremiums: relayPage([{ uuid: "pay-1", receivedAmount: "100.00" }], {
          totalCount: 3,
          pageInfo: { hasNextPage: true },
        }),
      });

      expect(state.premiumsPayments).toEqual([{ uuid: "pay-1", receivedAmount: "100.00" }]);
      expect(state.premiumsPaymentsPageInfo).toMatchObject({ totalCount: 3, hasNextPage: true });
      expect(state.fetchedPremiumsPayments).toBe(true);
      expect(state.fetchingPremiumsPayments).toBe(false);
    });

    it("surfaces a data error", () => {
      const state = dispatch(initial(), "PAYMENT_PREMIUMS_PAYMENTS_RESP", {
        payload: { data: { paymentsByPremiums: relayPage([]) }, ...graphqlErrors("bad premium") },
      });

      expect(state.errorPremiumsPayments).toMatchObject({ detail: "bad premium" });
    });

    it("formats a transport failure", () => {
      expect(fail(initial(), "PAYMENT_PREMIUMS_PAYMENTS")).toMatchObject({
        fetchingPremiumsPayments: false,
        errorPremiumsPayments: SERVER_ERROR,
      });
    });
  });

  describe("payment search", () => {
    it("drops the previous page when a search starts", () => {
      const loaded = { ...initial(), payments: [{ uuid: "pay-1" }], fetchedPayment: true };

      expect(dispatch(loaded, "PAYMENT_PAYMENTS_REQ")).toMatchObject({
        fetchingPayments: true,
        fetchedPayment: false,
        payments: null,
        paymentsPageInfo: { totalCount: 0 },
        errorPayments: null,
      });
    });

    it("stores the page as returned", () => {
      const state = respond(initial(), "PAYMENT_PAYMENTS", {
        payments: relayPage([{ uuid: "pay-1" }, { uuid: "pay-2" }], { totalCount: 12 }),
      });

      expect(state.payments).toEqual([{ uuid: "pay-1" }, { uuid: "pay-2" }]);
      expect(state.paymentsPageInfo).toMatchObject({ totalCount: 12 });
      expect(state.fetchingPayments).toBe(false);
      expect(state.fetchedPayment).toBe(true);
    });

    it("formats a transport failure", () => {
      expect(fail(initial(), "PAYMENT_PAYMENTS")).toMatchObject({
        fetchingPayments: false,
        errorPayments: SERVER_ERROR,
      });
    });
  });

  describe("single payment", () => {
    it("forgets the previous payment while the next one loads", () => {
      const loaded = { ...initial(), payment: { uuid: "pay-1" }, fetchedPayment: true };

      expect(dispatch(loaded, "PAYMENT_OVERVIEW_REQ")).toMatchObject({
        payment: null,
        fetchingPayment: true,
        fetchedPayment: false,
        errorPayment: null,
      });
    });

    it("takes the first matching payment", () => {
      const state = respond(initial(), "PAYMENT_OVERVIEW", {
        payments: relayPage([{ uuid: "pay-1" }, { uuid: "pay-2" }]),
      });

      expect(state.payment).toEqual({ uuid: "pay-1" });
      expect(state.fetchedPayment).toBe(true);
    });

    it.each([
      ["an empty page", relayPage([])],
      ["no page at all", null],
    ])("holds no payment for %s", (_label, page) => {
      expect(respond(initial(), "PAYMENT_OVERVIEW", { payments: page }).payment).toBeNull();
    });

    it("formats a transport failure", () => {
      expect(fail(initial(), "PAYMENT_OVERVIEW")).toMatchObject({
        fetchingPayment: false,
        errorPayment: SERVER_ERROR,
      });
    });

    it("forgets the payment when a new one is started", () => {
      const loaded = { ...initial(), payment: { uuid: "pay-1" }, paymentsPageInfo: { totalCount: 4 } };

      expect(dispatch(loaded, "PAYMENT_NEW")).toMatchObject({ payment: null, paymentsPageInfo: { totalCount: 0 } });
    });
  });

  describe("mutations", () => {
    const submitting = () =>
      dispatch(initial(), "PAYMENT_MUTATION_REQ", {
        meta: { clientMutationId: "cmid-1", clientMutationLabel: "Update payment" },
      });

    it("records the request metadata while a mutation is in flight", () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: "cmid-1", clientMutationLabel: "Update payment" },
      });
    });

    it.each([
      ["PAYMENT_CREATE", "createPayment"],
      ["PAYMENT_UPDATE", "updatePayment"],
      ["PAYMENT_DELETE", "deletePayment"],
    ])("clears the in-flight flag and keeps the internal id of %s", (type, service) => {
      const state = respond(submitting(), type, { [service]: { internalId: "internal-1" } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation).toMatchObject({ id: "internal-1", clientMutationId: "cmid-1" });
    });

    it("raises an alert when a mutation fails", () => {
      const state = fail(submitting(), "PAYMENT_MUTATION", { status: 500, statusText: "Internal Server Error" });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: "Internal Server Error" });
    });

    // Currently fails: fe-core's dispatchMutationErr only sets the alert, so the payment
    // form and searchers never see submittingMutation drop after a failed save.
    it.fails("stops submitting once a mutation has failed", () => {
      expect(fail(submitting(), "PAYMENT_MUTATION").submittingMutation).toBe(false);
    });
  });

  describe("immutability", () => {
    it("does not mutate the state it was given", () => {
      const state = initial();
      const snapshot = JSON.stringify(state);

      respond(state, "PAYMENT_PAYMENTS", { payments: relayPage([{ uuid: "pay-1" }]) });
      dispatch(state, "POLICY_FAMILY_POLICIES_REQ");

      expect(JSON.stringify(state)).toBe(snapshot);
    });
  });
});
