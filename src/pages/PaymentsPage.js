import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { historyPush, withModulesManager, withHistory, withTooltip, formatMessage } from "@openimis/fe-core"
import PaymentSearcher from "../components/PaymentSearcher";

import { RIGHT_PAYMENT_ADD } from "../constants";

const styles = theme => ({
    page: theme.page,
    fab: theme.fab
});


class PaymentsPage extends Component {
    // onAdd = () => {
    //     historyPush(this.props.modulesManager, this.props.history, "payment.paymentNew");
    // }

    render() {
        const { intl, classes, rights } = this.props;
        return (
            <div className={classes.page}>
                <PaymentSearcher
                    cacheFiltersKey="paymentsPageFiltersCache"
                />
                {/* {rights.includes(RIGHT_PAYMENT_ADD) &&
                    withTooltip(
                        <div className={classes.fab}>
                            <Fab color="primary" onClick={this.onAdd}>
                                <AddIcon />
                            </Fab>
                        </div>,
                        formatMessage(intl, "payment", "addNewPaymentTooltip")
                    )
                } */}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
})

export default injectIntl(withModulesManager(
    withHistory(connect(mapStateToProps)(withTheme(withStyles(styles)(PaymentsPage))))
));