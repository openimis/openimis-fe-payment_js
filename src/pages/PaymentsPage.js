import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
  withModulesManager,
  withHistory,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import PaymentSearcher from "../components/PaymentSearcher";

const styles = theme => ({
    page: theme.page,
    fab: theme.fab
});

class PaymentsPage extends Component {
    // onAdd = () => {
    //     historyPush(this.props.modulesManager, this.props.history, "payment.paymentNew");
    // }

    componentDidMount = () => {
        const moduleName = "payment";
        const { module } = this.props;
        if (module !== moduleName) this.props.clearCurrentPaginationPage();
      };

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
    module: state.core?.savedPagination?.module,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export default injectIntl(withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(PaymentsPage))))
));