import { parseData, pageInfo, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetchingPremiumsPayments: false,
        fetchedPremiumsPayments: false,
        errorPremiumsPayments: null,
        premiumsPayments: null,
        premiumsPaymentsPageInfo: { totalCount: 0 },
        payments: [],
        paymentsPageInfo: { totalCount: 0 },
        fetchingPayments: false,
        fetchedPayment: false,
        errorPayments: null,
    },
    action,
) {
    switch (action.type) {
        case 'INSUREE_FAMILY_OVERVIEW_REQ':
            return {
                ...state,
                fetchingPremiumsPayments: false,
                fetchedPremiumsPayments: false,
                premiumsPayments: null,
                premiumsPaymentsPageInfo: { totalCount: 0 },
                errorPremiumsPayments: null,
            }
        case 'POLICY_INSUREE_POLICIES_REQ':
        case 'POLICY_FAMILY_POLICIES_REQ':
        case 'CONTRIBUTION_POLICES_PREMIUMS_REQ':
        case 'PAYMENT_PREMIUMS_PAYMENTS_REQ':
            return {
                ...state,
                fetchingPremiumsPayments: true,
                fetchedPremiumsPayments: false,
                premiumsPayments: null,
                premiumsPaymentsPageInfo: { totalCount: 0 },
                errorPremiumsPayments: null,
            };
        case 'PAYMENT_PREMIUMS_PAYMENTS_RESP':
            return {
                ...state,
                fetchingPremiumsPayments: false,
                fetchedPremiumsPayments: true,
                premiumsPayments: parseData(action.payload.data.paymentsByPremiums),
                premiumsPaymentsPageInfo: pageInfo(action.payload.data.paymentsByPremiums),
                errorPremiumsPayments: formatGraphQLError(action.payload)
            };
        case 'PAYMENT_PREMIUMS_PAYMENTS_ERR':
            return {
                ...state,
                fetchingPremiumsPayments: false,
                errorPremiumsPayments: formatServerError(action.payload)
            };

        case 'PAYMENT_PAYMENTS_REQ':
            return {
                ...state,
                fetchingPayments: true,
                fetchedPayment: false,
                payments: null,
                paymentsPageInfo: { totalCount: 0 },
                errorPayments: null,
            };
        case 'PAYMENT_PAYMENTS_ERR':
            return {
                ...state,
                fetchingPayments: false,
                errorPayments: formatServerError(action.payload)
            };
        case 'PAYMENT_PAYMENTS_RESP':
            return {
                ...state,
                fetchingPayments: false,
                fetchedPayment: true,
                payments: parseData(action.payload.data.payments),
                paymentsPageInfo: pageInfo(action.payload.data.payments),
                errorPayments: formatGraphQLError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
