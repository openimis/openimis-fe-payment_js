import {
    baseApiUrl, graphql, formatQuery, formatPageQuery, formatPageQueryWithCount,
    formatMutation, decodeId, openBlob, formatJsonField
} from "@openimis/fe-core";
import _ from "lodash";
import _uuid from "lodash-uuid";

const PAYMENT_SUMMARIES_PROJECTION =
[
    "uuid",
    "id",
    "requestDate",
    "expectedAmount",
    "receivedDate",
    "receivedAmount",
    "status",
    "receiptNo",
    "typeOfPayment"
];
const PAYMENT_FULL_PROJECTION =
[
    ...PAYMENT_SUMMARIES_PROJECTION,
    "officerCode",
    "phoneNumber",
    "transactionNo",
    "origin",
    "matchedDate",
    "rejectedReason",
    "dateLastSms",
    "languageName",
    "transferFee"
];

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


export function createPayment(mm, contribution, clientMutationLabel) {
    let mutation = formatMutation("createPayment", formatContributionGQL(mm, contribution), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
      mutation.payload,
      ['CONTRIBUTION_MUTATION_REQ', 'CONTRIBUTION_CREATE_RESP', 'CONTRIBUTION_MUTATION_ERR'],
      {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime
      }
    )
  }
  
  export function updatePayment(mm, contribution, clientMutationLabel) {
    let mutation = formatMutation("updatePayment", formatContributionGQL(mm, contribution), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
      mutation.payload,
      ['CONTRIBUTION_MUTATION_REQ', 'CONTRIBUTION_UPDATE_RESP', 'CONTRIBUTION_MUTATION_ERR'],
      {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime,
        fpaymentUuid: contribution.uuid,
      }
    )
  }

export function fetchPayment(mm, paymentUuid) {
    let filters = []
    if (!!paymentUuid) {
      filters.push(`uuid: "${paymentUuid}"`)
    }
    const payload = formatPageQuery("payments",
      filters,
      PAYMENT_FULL_PROJECTION
    );
    return graphql(payload, 'PAYMENT_OVERVIEW');
  }

  export function newPayment() {
    return dispatch => {
      dispatch({ type: 'PAYMENT_NEW' })
    }
  }
