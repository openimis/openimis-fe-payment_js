import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper } from "@material-ui/core";
import {
    formatMessageWithValues, formatAmount, formatDateFromISO, withModulesManager,
    PublishedComponent, Table, PagedDataHandler
} from "@openimis/fe-core";

import { fetchPremiumsPayments } from "../actions";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    fab: theme.fab,
});

class PremiumsPaymentsOverview extends PagedDataHandler {

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-insuree", "premiumsPaymentsOverview.rowsPerPageOptions", [5, 10, 20]);
        this.defaultPageSize = props.modulesManager.getConf("fe-insuree", "premiumsPaymentsOverview.defaultPageSize", 5);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((!_.isEqual(prevProps.policiesPremiums, this.props.policiesPremiums) && !!this.props.policiesPremiums && !!this.props.policiesPremiums.length) ||
            (!_.isEqual(prevProps.premium, this.props.premium))
        ) {
            this.query();
        }
    }

    queryPrms = () => {
        if (!!this.props.premium) {
            return [`premiumUuids: ${JSON.stringify([this.props.premium.uuid])}`]
        } else {
            return [`premiumUuids: ${JSON.stringify((this.props.policiesPremiums || []).map(p => p.uuid))}`]
        }
    }

    headers = [
        "payment.payment.typeOfPayment",
        "payment.payment.requestDate",
        "payment.payment.expectedAmount",
        "payment.payment.receivedDate",
        "payment.payment.receivedAmount",
        "payment.payment.receiptNo",
        "payment.payment.status",
    ];

    formatters = [
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
    ];

    header = () => {
        const { modulesManager, intl, pageInfo, premium } = this.props;
        if (!!premium && !!premium.uuid) {
            return formatMessageWithValues(
                intl, "payment", "PremiumsPaymentsOfPremium",
                {
                    count: pageInfo.totalCount,
                    premium: `${formatDateFromISO(modulesManager, intl, premium.payDate)}`
                }
            )
        } else {
            return formatMessageWithValues(
                intl, "payment", "PremiumsPayments",
                { count: pageInfo.totalCount }
            )
        }
    }


    render() {
        const { intl, classes, family, premiumsPayments, pageInfo } = this.props;
        if (!family.uuid) return null;
        return (
            <Paper className={classes.paper}>
                <Table
                    module="payment"
                    header={this.header()}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={premiumsPayments || []}
                    withPagination={true}
                    rowsPerPageOptions={this.rowsPerPageOptions}
                    defaultPageSize={this.defaultPageSize}
                    page={this.currentPage()}
                    pageSize={this.currentPageSize()}
                    count={pageInfo.totalCount}
                    onChangePage={this.onChangePage}
                    onChangeRowsPerPage={this.onChangeRowsPerPage}
                />
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    family: state.insuree.family || {},
    premium: state.contribution.premium,
    policiesPremiums: state.contribution.policiesPremiums,
    fetchingPremiumsPayments: state.payment.fetchingPremiumsPayment,
    fetchedPremiumsPayments: state.payment.fetchedPremiumsPayment,
    premiumsPayments: state.payment.premiumsPayments,
    pageInfo: state.payment.premiumsPaymentsPageInfo,
    errorPremiumsPayment: state.payment.errorPremiumsPayment,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetch: fetchPremiumsPayments }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PremiumsPaymentsOverview)))));