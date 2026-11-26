import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen } from "@openimis/fe-core/testing";
import { PAYMENTS_TAB_VALUE } from "../constants";
import { PaymentsTabPanel } from "./PaymentsTab";

// A modules manager with fe-core's refs only: PolicyHolderModule is not installed,
// so policyHolder.TabPanel is not registered.
const { refs } = vi.hoisted(() => ({ refs: {} }));

vi.mock("@openimis/fe-core", async () => {
  const ReactActual = (await import("react")).default;
  refs["core.TabPanel"] = ({ value, index, children }) =>
    value === index ? ReactActual.createElement("div", { "data-testid": "core-tab-panel" }, children) : null;
  return {
    formatMessage: (intl, module, id) => id,
    PublishedComponent: ({ pubRef, ...props }) => {
      const Component = refs[pubRef];
      return Component ? ReactActual.createElement(Component, props) : null;
    },
  };
});

vi.mock("./PaymentSearcher", () => ({
  default: () => <div data-testid="payment-searcher" />,
}));

describe("PaymentsTabPanel", () => {
  it("renders its content through core.TabPanel without PolicyHolderModule", () => {
    renderWithProviders(<PaymentsTabPanel value={PAYMENTS_TAB_VALUE} isTabsEnabled />);

    expect(screen.getByTestId("payment-searcher")).toBeInTheDocument();
  });
});
