import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

export function fetchPremiumsPayments(mm, filters) {
    let payload = formatPageQueryWithCount("paymentsByPremiums",
        filters,
        ["id", "requestDate", "expectedAmount", "receivedDate", "receivedAmount", "status", "receiptNo", "typeOfPayment"]
    );
    return graphql(payload, 'PAYMENT_PREMIUMS_PAYMENTS');
}