import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import {
  withModulesManager,
  withHistory,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import { MODULE_NAME } from "../constants";
import PaymentSearcher from "../components/PaymentSearcher";

const StyledPaymentsPage = styled('div')(({ theme }) => ({
  '& .page': theme.page,
  '& .fab': theme.fab
}));

class PaymentsPage extends Component {
    // onAdd = () => {
    //     historyPush(this.props.modulesManager, this.props.history, "payment.paymentNew");
    // }

    componentDidMount = () => {
        const { module } = this.props;
        if (module !== MODULE_NAME) this.props.clearCurrentPaginationPage();
      };

    render() {
        const { intl, rights } = this.props;
        return (
            <StyledPaymentsPage>
                <div className="page">
                    <PaymentSearcher
                        cacheFiltersKey="paymentsPageFiltersCache"
                    />
                    {/* {rights.includes(RIGHT_PAYMENT_ADD) &&
                        withTooltip(
                            <div className="fab">
                                <Fab color="primary" onClick={this.onAdd}>
                                    <AddIcon />
                                </Fab>
                            </div>,
                            formatMessage(intl, "payment", "addNewPaymentTooltip")
                        )
                    } */}
                </div>
            </StyledPaymentsPage>
        )
    }
}

const mapStateToProps = state => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    module: state.core?.savedPagination?.module,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage }, dispatch);

export { StyledPaymentsPage };
export default injectIntl(withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(PaymentsPage))
));