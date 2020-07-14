import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

export function fetchPremiumsPayments(mm, premiumUuids) {
    let payload = formatPageQuery("paymentsByPremiums",
        [`premiumUuids: ${JSON.stringify(premiumUuids)}`],
        ["id", "requestDate", "expectedAmount", "receivedDate", "receivedAmount", "status", "receiptNo", "typeOfPayment"]
    );
    return graphql(payload, 'PAYMENT_PREMIUMS_PAYMENTS');
}