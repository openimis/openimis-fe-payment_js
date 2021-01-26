import React from "react";
import PaymentIcon from '@material-ui/icons/Payment';
import { FormattedMessage } from "@openimis/fe-core";

import messages_en from "./translations/en.json";
import PremiumsPaymentsOverview from "./components/PremiumsPaymentsOverview";
import PaymentOverviewPage from "./pages/PaymentOverviewPage";
import PaymentStatusPicker from "./pickers/PaymentStatusPicker";
import PaymentsPage from "./pages/PaymentsPage";
import PaymentPage from "./pages/PaymentPage";
import reducer from "./reducer";

import { RIGHT_PAYMENT } from "./constants";


const ROUTE_PAYMENTS = "payment/payments";
const ROUTE_PAYMENTS_PAYMENT = "payment/payment";
const ROUTE_PAYMENTS_PAYMENT_OVERVIEW = "payment/paymentOverview";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'payment', reducer }],

  "refs": [
    { key: "payment.PaymentStatusPicker", ref: PaymentStatusPicker },
    { key: "payment.payments", ref: ROUTE_PAYMENTS },
    { key: "payment.payment", ref: ROUTE_PAYMENTS_PAYMENT },
    { key: "payment.paymentOverview", ref: ROUTE_PAYMENTS_PAYMENT_OVERVIEW },
  ],
  "core.Router": [
    { path: ROUTE_PAYMENTS, component: PaymentsPage },
    { path: ROUTE_PAYMENTS_PAYMENT, component: PaymentPage },
    { path: ROUTE_PAYMENTS_PAYMENT_OVERVIEW + "/:payment_uuid", component: PaymentOverviewPage },
  ],
  "insuree.FamilyOverview.panels": [PremiumsPaymentsOverview],
  "insuree.MainMenu": [
    {
      text: <FormattedMessage module="payment" id="menu.payments" />,
      icon: <PaymentIcon />,
      route: "/" + ROUTE_PAYMENTS,
      filter: rights => rights.includes(RIGHT_PAYMENT)
    }
  ],
}

export const PaymentModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}