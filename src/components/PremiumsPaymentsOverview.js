import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper } from "@material-ui/core";
import {
    formatMessage, formatAmount, formatDateFromISO, withModulesManager,
    PublishedComponent, Table
} from "@openimis/fe-core";

import { fetchPremiumsPayments } from "../actions";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    fab: theme.fab,
});

class PremiumsPaymentsOverview extends Component {

    componentDidMount() {
        if (!!this.props.policiesPremiums && !!this.props.policiesPremiums.length) {
            this.props.fetchPremiumsPayments(this.props.policiesPremiums.map(p => p.uuid));
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.policiesPremiums && !!this.props.policiesPremiums && !!this.props.policiesPremiums.length) {
            this.props.fetchPremiumsPayments(this.props.modulesManager, this.props.policiesPremiums.map(p => p.uuid));
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

    render() {
        const { intl, classes, premiumsPayments } = this.props;
        return (
            <Paper className={classes.paper}>
                <Table
                    module="payment"
                    header={formatMessage(intl, "payment", "PremiumsPayments")}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={premiumsPayments || []}
                />
            </Paper>
        )
    }
}

const mapStateToProps = state => ({
    policiesPremiums: state.contribution.policiesPremiums,
    fetchingPremiumsPayments: state.payment.fetchingPremiumsPayment,
    fetchedPremiumsPayments: state.payment.fetchedPremiumsPayment,
    premiumsPayments: state.payment.premiumsPayments,
    errorPremiumsPayment: state.payment.errorPremiumsPayment,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPremiumsPayments }, dispatch);
};

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PremiumsPaymentsOverview)))));