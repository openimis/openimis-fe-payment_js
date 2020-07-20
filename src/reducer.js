import { parseData, pageInfo, formatServerError, formatGraphQLError } from '@openimis/fe-core';

function reducer(
    state = {
        fetchingPremiumsPayments: false,
        fetchedPremiumsPayments: false,
        errorPremiumsPayments: null,
        premiumsPayments: null,
        premiumsPaymentsPageInfo: { totalCount: 0 },
    },
    action,
) {
    switch (action.type) {
        case 'CONTRIBUTION_POLICES_PREMIUMS_REQ':
        case 'PAYMENT_PREMIUMS_PAYMENTS_REQ':
            return {
                ...state,
                fetchingPremiumsPayments: true,
                fetchedPremiumsPayments: false,
                premiumsPayments: null,
                errorPremiumsPayments: null,
            };
        case 'PAYMENT_PREMIUMS_PAYMENTS_RESP':
            return {
                ...state,
                fetchingPremiumsPayments: false,
                fetchedPremiumsPayments: true,
                premiumsPayments: parseData(action.payload.data.paymentsByPremiums),
                errorPremiumsPayments: formatGraphQLError(action.payload)
            };
        case 'PAYMENT_PREMIUMS_PAYMENTS_ERR':
            return {
                ...state,
                fetchingPremiumsPayments: false,
                errorPremiumsPayments: formatServerError(action.payload)
            };
        default:
            return state;
    }
}

export default reducer;
