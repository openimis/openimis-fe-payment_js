import React, { Component } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush,
} from "@openimis/fe-core";
import PaymentForm from "../components/PaymentForm";
import { createPayment, updatePayment } from "../actions";
import { RIGHT_PAYMENT_ADD, RIGHT_PAYMENT_EDIT } from "../constants";

const styles = theme => ({
    page: theme.page,
});

class PaymentPage extends Component {

    add = () => {
        historyPush(this.props.modulesManager, this.props.history, "payment.payment")
    }

    save = (payment) => {
        if (!payment.uuid) {
            this.props.createPayment(
                this.props.modulesManager,
                payment,
                formatMessageWithValues(
                    this.props.intl,
                    "payment",
                    "CreatePayment.mutationLabel",
                )
            );
        } else {
            this.props.updatePayment(
                this.props.modulesManager,
                payment,
                formatMessageWithValues(
                    this.props.intl,
                    "payment",
                    "UpdatePayment.mutationLabel",
                )
            );

        }
    }

    render() {
        const { classes, modulesManager, history, rights, payment_uuid, overview } = this.props;
        if (!rights.includes(RIGHT_PAYMENT_EDIT)) return null;

        return (
            <div className={classes.page}>
                <PaymentForm
                    overview={overview}
                    payment_uuid={payment_uuid}
                    back={e => historyPush(modulesManager, history, "payment.payments")}
                    add={rights.includes(RIGHT_PAYMENT_ADD) ? this.add : null}
                    save={rights.includes(RIGHT_PAYMENT_EDIT) ? this.save : null}
                />
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    payment_uuid: props.match.params.payment_uuid,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ createPayment, updatePayment }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(PaymentPage))
    ))));