import React, { useEffect } from "react";
import { Helmet, withModulesManager, formatMessage, clearCurrentPaginationPage } from "@openimis/fe-core";
import { injectIntl } from "react-intl";
import { styled } from "@mui/material/styles";
import { connect, useDispatch } from "react-redux";
import { RIGHT_BILL_PAYMENT_SEARCH } from "../constants";
import PaymentInvoiceSearcher from "../components/PaymentInvoiceSearcher";

const StyledPaymentInvoicesPage = styled('div')(({ theme }) => ({
  '& .page': theme.page ?? {},
}));

const PaymentInvoicesPage = ({ intl, rights }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCurrentPaginationPage());
  }, []);

  return (
    rights.includes(RIGHT_BILL_PAYMENT_SEARCH) && (
      <StyledPaymentInvoicesPage>
        <div className="page">
          <Helmet title={formatMessage(intl, "payment", "invoices.pageTitle")} />
          <PaymentInvoiceSearcher rights={rights} />
        </div>
      </StyledPaymentInvoicesPage>
    )
  );
};

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export { StyledPaymentInvoicesPage };
export default withModulesManager(
  injectIntl(connect(mapStateToProps)(PaymentInvoicesPage)),
);
