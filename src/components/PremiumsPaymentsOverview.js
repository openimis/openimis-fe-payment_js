import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import _ from "lodash";
import { Paper, Grid, Divider, Typography, IconButton } from "@material-ui/core";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@material-ui/icons';

import {
    formatMessageWithValues, formatAmount, formatDateFromISO, withModulesManager, formatMessage, withTooltip,
    formatSorter, sort,
    PublishedComponent, Table, PagedDataHandler
} from "@openimis/fe-core";

import { fetchPremiumsPayments } from "../actions";

const styles = theme => ({
    paper: theme.paper.paper,
    paperHeader: theme.paper.header,
    paperHeaderAction: theme.paper.action,
    tableTitle: theme.table.title,
    fab: theme.fab,
});

class PremiumsPaymentsOverview extends PagedDataHandler {

    constructor(props) {
        super(props);
        this.rowsPerPageOptions = props.modulesManager.getConf("fe-insuree", "premiumsPaymentsOverview.rowsPerPageOptions", [5, 10, 20]);
        this.defaultPageSize = props.modulesManager.getConf("fe-insuree", "premiumsPaymentsOverview.defaultPageSize", 5);
    }

    componentDidMount() {
        this.setState({ orderBy: "-requestDate" }, e => this.query())
    }

    addNewPayment = () => alert("Will be implemented along Payment module migration!")
    deletePayment = () => alert("Will be implemented along Payment module migration!")

    onDoubleClick = (i, newTab = false) => {
        alert("Will be implemented along Payment module migration!")
    }


    premiumsChanged = (prevProps) =>
        (!_.isEqual(prevProps.policiesPremiums, this.props.policiesPremiums) && !!this.props.policiesPremiums && !!this.props.policiesPremiums.length) ||
        (!_.isEqual(prevProps.premium, this.props.premium))

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.premiumsChanged(prevProps)) {
            this.query();
        }
    }

    queryPrms = () => {
        let prms = [`orderBy: "${this.state.orderBy}"`];
        if (!!this.props.premium) {
            prms.push(`premiumUuids: ${JSON.stringify([this.props.premium.uuid])}`);
            return prms;
        } else if (this.props.policiesPremiums && !!this.props.policiesPremiums.length) {
            prms.push(`premiumUuids: ${JSON.stringify((this.props.policiesPremiums || []).map(p => p.uuid))}`);
            return prms;
        }
        return null;
    }

    headers = [
        "payment.payment.typeOfPayment",
        "payment.payment.requestDate",
        "payment.payment.expectedAmount",
        "payment.payment.receivedDate",
        "payment.payment.receivedAmount",
        "payment.payment.receiptNo",
        "payment.payment.status",
        "",
    ];

    sorter = (attr, asc = true) => [
        () => this.setState((state, props) => ({ orderBy: sort(state.orderBy, attr, asc) }), e => this.query()),
        () => formatSorter(this.state.orderBy, attr, asc)
    ]

    headerActions = [
        this.sorter("typeOfPayment"),
        this.sorter("requestDate"),
        this.sorter("expectedAmount"),
        this.sorter("receivedDate"),
        this.sorter("receivedAmount"),
        this.sorter("receiptNo"),
        this.sorter("status"),
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
        p => withTooltip(<IconButton onClick={this.deletePayment}><DeleteIcon /></IconButton>, formatMessage(this.props.intl, "payment", "deletePayment.tooltip"))
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
        const { intl, classes, family, premiumsPayments, pageInfo, reset, readOnly } = this.props;
        if (!family.uuid) return null;

        let actions = !!readOnly ? [] : [
            {
                button: <IconButton onClick={this.addNewPayment}><AddIcon /></IconButton>,
                tooltip: formatMessage(intl, "payment", "addNewPayment.tooltip")
            }
        ];

        return (
            <Paper className={classes.paper}>
                <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
                    <Grid item xs={8}>
                        <Typography className={classes.tableTitle}>
                            {this.header()}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container direction="row" justify="flex-end">
                            {actions.map((a, idx) => {
                                return (
                                    <Grid item key={`form-action-${idx}`} className={classes.paperHeaderAction}>
                                        {withTooltip(a.button, a.tooltip)}
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Grid>
                </Grid>
                <Divider />
                <Table
                    module="payment"
                    headerActions={this.headerActions}
                    headers={this.headers}
                    itemFormatters={this.formatters}
                    items={premiumsPayments || []}
                    withPagination={true}
                    onDoubleClick={this.onDoubleClick}
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