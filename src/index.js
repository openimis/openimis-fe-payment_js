import messages_en from "./translations/en.json";
import PremiumsPaymentsOverview from "./components/PremiumsPaymentsOverview";
import PaymentStatusPicker from "./pickers/PaymentStatusPicker";
import reducer from "./reducer";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: 'payment', reducer }],

  "refs": [
    { key: "payment.PaymentStatusPicker", ref: PaymentStatusPicker },
  ],


  "insuree.FamilyOverview.panels": [PremiumsPaymentsOverview],
}

export const PaymentModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}