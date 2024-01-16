import {
    graphql,
    formatPageQuery,
    formatPageQueryWithCount,
    formatMutation,
    formatGQLString,
} from "@openimis/fe-core";
import _ from "lodash";

const PAYMENT_SUMMARIES_PROJECTION = mm =>
[
    "uuid",
    "id",
    "requestDate",
    "expectedAmount",
    "receivedDate",
    "receivedAmount",
    "status",
    "receiptNo",
    "typeOfPayment",
    "clientMutationId",
    "validityTo",
    // `paymentDetails{edges{node{premium${mm.getProjection("contribution.PremiumPicker.projection")}}}}`
];
const PAYMENT_FULL_PROJECTION = mm =>
[
    ...PAYMENT_SUMMARIES_PROJECTION(mm),
    "officerCode",
    "phoneNumber",
    "transactionNo",
    "origin",
    "matchedDate",
    "rejectedReason",
    "dateLastSms",
    "languageName",
    "transferFee",
    "clientMutationId",
];

const PAYMENT_INVOICE_FULL_PROJECTION = [
  "id",
  "reconciliationStatus",
  "codeExt",
  "codeTp",
  "codeReceipt",
  "label",
  "fees",
  "amountReceived",
  "datePayment",
  "paymentOrigin",
  "payerRef"
];

const DETAIL_PAYMENT_INVOICE_FULL_PROJECTION = [
  "id",
  "status",
  "fees",
  "amount",
  "reconciliationId",
  "reconciliationDate",
];


export function fetchPremiumsPayments(mm, filters) {
    let payload = formatPageQueryWithCount("paymentsByPremiums",
        filters,
        PAYMENT_SUMMARIES_PROJECTION(mm)
    );
    return graphql(payload, 'PAYMENT_PREMIUMS_PAYMENTS');
}

export function fetchPaymentsSummaries(mm, filters) {
  const payload = formatPageQueryWithCount("payments",
    filters,
    PAYMENT_SUMMARIES_PROJECTION(mm)
  );
  return graphql(payload, 'PAYMENT_PAYMENTS');
}

export function newPayment() {
  return dispatch => {
    dispatch({ type: 'PAYMENT_NEW' })
  }
}
export function formatPaymentGQL(mm, payment) {
  const req = `
    ${payment.uuid !== undefined && payment.uuid !== null ? `uuid: "${payment.uuid}"` : ''}
    ${!!payment.receivedDate ? `receivedDate: "${payment.receivedDate}"` : ""}
    ${!!payment.requestDate ? `requestDate: "${payment.requestDate}"` : ""}
    ${!!payment.matchedDate ? `matchedDate: "${payment.matchedDate}"` : ""}
    ${!!payment.dateLastSms ? `dateLastSms: "${payment.dateLastSms}"` : ""}
    ${!!payment.expectedAmount ? `expectedAmount: "${payment.expectedAmount}"` : ""}
    ${!!payment.receivedAmount ? `receivedAmount: "${payment.receivedAmount}"` : ""}
    ${!!payment.transferFee ? `transferFee: "${payment.transferFee}"` : ""}
    ${!!payment.status ? `status: ${payment.status}` : ""}
    ${!!payment.receiptNo ? `receiptNo: "${formatGQLString(payment.receiptNo)}"` : ""}
    ${!!payment.typeOfPayment ? `typeOfPayment: "${payment.typeOfPayment}"` : ""}
    ${!!payment.officerCode ? `officerCode: "${formatGQLString(payment.officerCode)}"` : ""}
    ${!!payment.origin ? `origin: "${formatGQLString(payment.origin)}"` : ""}
    ${!!payment.rejectedReason ? `rejectedReason: "${formatGQLString(payment.rejectedReason)}"` : ""}
    ${!!payment.premium_uuid ? `premiumUuid: "${payment.premium_uuid}"` : ""}
  `
  return req;
}

const formatPaymentInvoiceGQL = (payment, subjectId, subjectType) =>
  `
    ${!!payment.id ? `id: "${payment.id}"` : ""}
    ${!!subjectId ? `subjectId: "${subjectId}"` : ""}
    ${!!subjectType ? `subjectType: "${subjectType}"` : ""}
    ${!!payment.status ? `status: ${payment.status}` : ""}
    ${!!payment.reconciliationStatus ? `reconciliationStatus: ${payment.reconciliationStatus}` : ""}
    ${!!payment.codeExt ? `codeExt: "${payment.codeExt}"` : ""}
    ${!!payment.label ? `label: "${payment.label}"` : ""}
    ${!!payment.codeTp ? `codeTp: "${payment.codeTp}"` : ""}
    ${!!payment.codeReceipt ? `codeReceipt: "${payment.codeReceipt}"` : ""}
    ${!!payment.fees ? `fees: "${payment.fees}"` : ""}
    ${!!payment.amountReceived ? `amountReceived: "${payment.amountReceived}"` : ""}
    ${!!payment.datePayment ? `datePayment: "${payment.datePayment}"` : ""}
    ${!!payment.paymentOrigin ? `paymentOrigin: "${payment.paymentOrigin}"` : ""}
    ${!!payment.payerRef ? `payerRef: "${payment.payerRef}"` : ""}
  `;

export function createPayment(mm, payment, clientMutationLabel) {
    let mutation = formatMutation("createPayment", formatPaymentGQL(mm, payment), clientMutationLabel);
    var requestedDateTime = new Date();
    return graphql(
      mutation.payload,
      ['PAYMENT_MUTATION_REQ', 'PAYMENT_CREATE_RESP', 'PAYMENT_MUTATION_ERR'],
      {
        clientMutationId: mutation.clientMutationId,
        clientMutationLabel,
        requestedDateTime
      }
    )
  }

export function updatePayment(mm, payment, clientMutationLabel) {
  let mutation = formatMutation("updatePayment", formatPaymentGQL(mm, payment), clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['PAYMENT_MUTATION_REQ', 'PAYMENT_UPDATE_RESP', 'PAYMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      paymentUuid: payment.uuid,
    }
  )
}

export function deletePayment(mm, payment, clientMutationLabel) {
  let mutation = formatMutation("deletePayment", `uuids: ["${payment.uuid}"]`, clientMutationLabel);
  payment.clientMutationId = mutation.clientMutationId;
  var requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['PAYMENT_MUTATION_REQ', 'PAYMENT_DELETE_RESP', 'PAYMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
      paymentUuid: payment.uuid,
    }
  )
}

export function fetchPayment(mm, paymentUuid, clientMutationId) {
    let filters = []
    if (!!paymentUuid) {
      filters.push(`uuid: "${paymentUuid}"`)
    } else if (!!clientMutationId){
      filters.push(`clientMutationId: "${clientMutationId}"`)
    }
    const payload = formatPageQuery("payments",
      filters,
      PAYMENT_FULL_PROJECTION(mm)
    );
    return graphql(payload, 'PAYMENT_OVERVIEW');
  }


export function fetchPaymentInvoices(params) {
  const payload = formatPageQueryWithCount("paymentInvoice", params, PAYMENT_INVOICE_FULL_PROJECTION);
  return graphql(payload, "PAYMENTINVOICE__PAYMENT_INVOICE");
}

export function fetchDetailPaymentInvoices(params) {
  const payload = formatPageQueryWithCount("detailPaymentInvoice", params, DETAIL_PAYMENT_INVOICE_FULL_PROJECTION);
  return graphql(payload, "PAYMENTINVOICE__DETAIL_PAYMENT_INVOICE");
}

export function createPaymentInvoiceWithDetail(paymentInvoice, subjectId, subjectType, clientMutationLabel) {
  const mutation = formatMutation(
    "createPaymentWithDetailInvoice", 
    formatPaymentInvoiceGQL(paymentInvoice, subjectId, subjectType), 
    clientMutationLabel
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["PAYMENT_MUTATION_REQ", "PAYMENTINVOICE_CREATE_PAYMENT_INVOICE_WITH_DETAIL_RESP", "PAYMENT_MUTATION_ERR"],
    {
      actionType: "PAYMENTINVOICE_CREATE_PAYMENT_INVOICE_WITH_DETAIL",
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function deletePaymentInvoice(paymentInvoice, clientMutationLabel) {
  const paymentInvoiceUuids = `uuids: ["${paymentInvoice?.id}"]`;
  const mutation = formatMutation("deletePaymentInvoice", paymentInvoiceUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ["PAYMENT_MUTATION_REQ", "PAYMENTINVOICE_DELETE_PAYMENT_INVOICE_RESP", "PAYMENT_MUTATION_ERR"],
    {
      actionType: "PAYMENTINVOICE_DELETE_PAYMENT_INVOICE",
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}
