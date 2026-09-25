import { describe, expect, it } from "vitest";

import { PaymentModule } from "../src/index";

const modulesManagerWith = (productsOrContributions) => ({
  getConf: (module, key, defaultValue) =>
    module === "fe-policy" && key === "productsOrContributions"
      ? productsOrContributions
      : defaultValue,
});

describe("PaymentModule configuration", () => {
  it("hides the payments entry of the insuree menu in contributions mode", () => {
    const config = PaymentModule({});

    expect(
      config["insuree.MainMenu"](modulesManagerWith("contributions"))
    ).toEqual([{ route: "payment/payments", hide: true }]);
  });

  it("keeps the payments entry of the insuree menu in products mode", () => {
    const config = PaymentModule({});

    expect(config["insuree.MainMenu"](modulesManagerWith("products"))).toEqual([
      { route: "payment/payments", hide: false },
    ]);
  });

  it("defaults to products mode when the config is not set", () => {
    const config = PaymentModule({});

    expect(
      config["insuree.MainMenu"]({
        getConf: (module, key, defaultValue) => defaultValue,
      })
    ).toEqual([{ route: "payment/payments", hide: false }]);
  });

  it("keeps the menu entry when the configuration holds an unexpected value", () => {
    const config = PaymentModule({});

    expect(
      config["insuree.MainMenu"](modulesManagerWith("contribution_plans"))
    ).toEqual([{ route: "payment/payments", hide: false }]);
  });

  it("keeps the invoice main menu untouched", () => {
    const config = PaymentModule({});

    expect(config["invoice.MainMenu"]).toEqual([
      { route: "payment/paymentsInvoice" },
    ]);
  });
});
