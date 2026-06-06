import React from "react";
import { GetIconComponent, FormattedMessage } from "@openimis/fe-core";

import messages_en from "./translations/en.json";
import PremiumsPaymentsOverview from "./components/PremiumsPaymentsOverview";
import PaymentOverviewPage from "./pages/PaymentOverviewPage";
import PaymentStatusPicker from "./pickers/PaymentStatusPicker";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentInvoicesPage from "./pages/PaymentInvoicesPage";
import PaymentPage from "./pages/PaymentPage";
import { PaymentsTabLabel, PaymentsTabPanel } from "./components/PaymentsTab";
import reducer from "./reducer";

import { RIGHT_PAYMENT, RIGHT_BILL_PAYMENT_SEARCH } from "./constants";

const PaymentIcon = GetIconComponent("Payment");

const ROUTE_PAYMENTS = "payment/payments";
const ROUTE_PAYMENTS_INVOICE = "payment/paymentsInvoice";
const ROUTE_PAYMENTS_PAYMENT = "payment/new";
const ROUTE_PAYMENTS_PAYMENT_OVERVIEW = "payment/overview";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'payment', reducer }],

  "refs": [
    { key: "payment.PaymentStatusPicker", ref: PaymentStatusPicker },
    { key: "payment.PaymentsTab.label", ref: PaymentsTabLabel },
    { key: "payment.PaymentsTab.panel", ref: PaymentsTabPanel },
    { key: "payment.payments", ref: ROUTE_PAYMENTS },
    { key: "payment.paymentNew", ref: ROUTE_PAYMENTS_PAYMENT },
    { key: "payment.paymentOverview", ref: ROUTE_PAYMENTS_PAYMENT_OVERVIEW },
  ],
  "core.Router": [
    { path: ROUTE_PAYMENTS, text: "payment.menu.payments",id: 'insuree.payment', icon: "paymentIcon", rights: [RIGHT_PAYMENT], component: PaymentsPage },
    { path: ROUTE_PAYMENTS_INVOICE, text: "payment.menu.payments", icon: "paymentIcon", rights: [RIGHT_BILL_PAYMENT_SEARCH], id: 'insuree.invoice',component: PaymentInvoicesPage },
    { path: ROUTE_PAYMENTS_PAYMENT+ "/:premium_uuid", rights: [RIGHT_PAYMENT], component: PaymentPage },
    { path: ROUTE_PAYMENTS_PAYMENT_OVERVIEW + "/:payment_uuid", rights: [RIGHT_BILL_PAYMENT_SEARCH],  component: PaymentOverviewPage },
  ],
  "insuree.FamilyOverview.panels": [PremiumsPaymentsOverview],
  "insuree.MainMenu": [
    {
      route:  ROUTE_PAYMENTS,
    }
  ],
  "invoice.MainMenu": [
    {
      route: ROUTE_PAYMENTS_INVOICE,
      
    }
  ]
}

export const PaymentModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}