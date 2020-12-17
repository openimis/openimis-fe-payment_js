import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

const PAYMENT_SUMMARIES_PROJECTION = ["id", "requestDate", "expectedAmount", "receivedDate", "receivedAmount", "status", "receiptNo", "typeOfPayment"];

export function fetchPremiumsPayments(mm, filters) {
    let payload = formatPageQueryWithCount("paymentsByPremiums",
        filters,
        PAYMENT_SUMMARIES_PROJECTION
    );
    return graphql(payload, 'PAYMENT_PREMIUMS_PAYMENTS');
}

export function fetchPaymentsSummaries(mm, filters) {
    const payload = formatPageQueryWithCount("payments",
      filters,
      PAYMENT_SUMMARIES_PROJECTION
    );
    return graphql(payload, 'PAYMENT_PAYMENTS');
  }
  