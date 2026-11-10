import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";

import { PremiumsPaymentsOverview } from "../../src/components/PremiumsPaymentsOverview";

const buildProps = ({ mode = "products", overrides = {} } = {}) => ({
  modulesManager: {
    getConf: (module, key, defaultValue) =>
      module === "fe-policy" && key === "productsOrContributions"
        ? mode
        : defaultValue,
  },
  intl: { formatMessage: ({ id }) => id },
  history: { push: vi.fn() },
  family: { uuid: "family-1" },
  edited: null,
  premium: null,
  rights: [],
  readOnly: false,
  premiumsPayments: [],
  fetchingPremiumsPayments: false,
  errorPremiumsPayments: null,
  pageInfo: { totalCount: 0 },
  fetchPremiumsPayments: vi.fn(),
  deletePayment: vi.fn(),
  ...overrides,
});

const renderPanel = (props) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <PremiumsPaymentsOverview {...props} />
    </IntlProvider>
  );

describe("PremiumsPaymentsOverview", () => {
  it("renders nothing in contributions mode", () => {
    const { container } = renderPanel(buildProps({ mode: "contributions" }));

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the payments panel in products mode", () => {
    renderPanel(buildProps({ mode: "products" }));

    expect(screen.getByText("PremiumsPayments")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders the panel when the configuration holds an unexpected value", () => {
    renderPanel(buildProps({ mode: "contribution_plans" }));

    expect(screen.getByText("PremiumsPayments")).toBeInTheDocument();
  });

  it("renders nothing when the family has no uuid", () => {
    const { container } = renderPanel(
      buildProps({ overrides: { family: {} } })
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a polygamous family", () => {
    const { container } = renderPanel(
      buildProps({
        overrides: { family: { uuid: "family-1", familyType: { code: "P" } } },
      })
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a polygamous edited family", () => {
    const { container } = renderPanel(
      buildProps({ overrides: { edited: { familyType: { code: "P" } } } })
    );

    expect(container).toBeEmptyDOMElement();
  });
});
