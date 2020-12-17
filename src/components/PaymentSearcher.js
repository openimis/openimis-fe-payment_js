
import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import {  IconButton, Tooltip } from "@material-ui/core";
import TabIcon from "@material-ui/icons/Tab";

import PaymentFilter from './PaymentFilter';
import {
    withModulesManager, formatMessageWithValues, formatDateFromISO, formatMessage,
    Searcher, PublishedComponent, formatAmount, withTooltip,
} from "@openimis/fe-core";

import { fetchPaymentsSummaries } from "../actions";
import { RIGHT_CONTRIBUTION_DELETE } from "../constants";
// import DeleteFamilyDialog from "./DeleteFamilyDialog";

const PAYMENT_SEARCHER_CONTRIBUTION_KEY = "payment.PaymentSearcher";

class PaymentSearcher extends Component {

    state = {
        deletePayment: null,
        reset: 0,
    }

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = [10, 20, 50, 100];
        this.defaultPageSize = 10;
        this.locationLevels = 4;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
        }
    }

    fetch = (prms) => {
        this.props.fetchPaymentsSummaries(
            this.props.modulesManager,
            prms
        )
    }

    rowIdentifier = (r) => r.uuid

    filtersToQueryParams = (state) => {
        let prms = Object.keys(state.filters)
            .filter(contrib => !!state.filters[contrib]['filter'])
            .map(contrib => state.filters[contrib]['filter']);
        prms.push(`first: ${state.pageSize}`);
        if (!!state.afterCursor) {
            prms.push(`after: "${state.afterCursor}"`)
        }
        if (!!state.beforeCursor) {
            prms.push(`before: "${state.beforeCursor}"`)
        }
        if (!!state.orderBy) {
            prms.push(`orderBy: ["${state.orderBy}"]`);
        }
        return prms;
    }

    headers = (filters) => {
        var h = [
            "payment.payment.receivedDate",
            "payment.payment.typeOfPayment",
            "payment.payment.requestDate",
            "payment.payment.expectedAmount",
            "payment.payment.receivedAmount",
            "payment.payment.receiptNo",
            "payment.payment.status",
        ]
        return h;
    }

    sorts = (filters) => {
        var results = [
            ['receivedDate', true],
            ['typeOfPayment', true],
            ['requestDate', true],
            ['expectedAmount', true],
            ['receivedAmount', true],
            ['receiptNo', true],
            ['status', true],
            "contribution.openNewTabHead"
        ];
        return results;
    }

    // deletePayment = (deleteMembers) => {
    //     let family = this.state.deletePayment;
    //     this.setState(
    //         { deletePayment: null },
    //         (e) => {
    //             this.props.deletePayment(
    //                 this.props.modulesManager,
    //                 family,
    //                 deleteMembers,
    //                 formatMessageWithValues(this.props.intl, "insuree", "deletePayment.mutationLabel", { label: familyLabel(family) }))
    //         })
    // }

    itemFormatters = () => {
        return [
            p => p.typeOfPayment,
            p => formatDateFromISO(this.props.modulesManager, this.props.intl, p.requestDate),
            p => formatAmount(this.props.intl, p.expectedAmount),
            p => formatDateFromISO(this.props.modulesManager, this.props.intl, p.receivedDate),
            p => formatAmount(this.props.intl, p.receivedAmount),
            p => p.receiptNo,
            p => <PublishedComponent
                readOnly={true}
                pubRef="payment.PaymentStatusPicker"
                withLabel={false}
                value={p.status}
                nullLabel="payment.status.none"
            />,
            p => (
                <Tooltip title={formatMessage(this.props.intl, "payment", "contribution.openNewTab")}>
                    <IconButton onClick={e => this.props.onDoubleClick(c, true)}payment> <TabIcon /></IconButton >
                </Tooltip>
            )
            // p => withTooltip(<IconButton onClick={this.deletePremium}><DeleteIcon /></IconButton>, formatMessage(this.props.intl, "payment", "deletePremium.tooltip"))
        ];
    }

    rowDisabled = (selection, i) => !!i.validityTo
    rowLocked = (selection, i) => !!i.clientMutationId

    render() {
        const { intl,
            payments, paymentsPageInfo, fetchingPayments, fetchedPayment, errorPayments,
            filterPaneContributionsKey, cacheFiltersKey, onDoubleClick
        } = this.props;
        let count = paymentsPageInfo.totalCount;
        return (
            <Fragment>
                {/* <DeleteFamilyDialog
                    family={this.state.deletePayment}
                    onConfirm={this.deletePayment}
                    onCancel={e => this.setState({ deletePayment: null })} /> */}
                <Searcher
                    module="payment"
                    cacheFiltersKey={cacheFiltersKey}
                    FilterPane={PaymentFilter}
                    filterPaneContributionsKey={filterPaneContributionsKey}
                    items={payments}
                    itemsPageInfo={paymentsPageInfo}
                    fetchingItems={fetchingPayments}
                    fetchedItems={fetchedPayment}
                    errorItems={errorPayments}
                    contributionKey={PAYMENT_SEARCHER_CONTRIBUTION_KEY}
                    tableTitle={formatMessageWithValues(intl, "payment", "paymentSummaries", { count })}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    fetch={this.fetch}
                    rowIdentifier={this.rowIdentifier}
                    filtersToQueryParams={this.filtersToQueryParams}
                    defaultOrderBy="-receivedDate"
                    headers={this.headers}
                    itemFormatters={this.itemFormatters}
                    sorts={this.sorts}
                    rowDisabled={this.rowDisabled}
                    rowLocked={this.rowLocked}
                    onDoubleClick={c => !c.clientMutationId && onDoubleClick(c)}
                    reset={this.state.reset}
                />
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    payments: state.payment.payments,
    paymentsPageInfo: state.payment.paymentsPageInfo,
    fetchingPayments: state.payment.fetchingPayments,
    fetchedPayment: state.payment.fetchedPayment,
    errorPayments: state.payment.errorPayments,
    submittingMutation: state.payment.submittingMutation,
    mutation: state.payment.mutation,
});


const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        { fetchPaymentsSummaries },
        dispatch);
};

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(injectIntl(PaymentSearcher)));