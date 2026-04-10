import React, { Component } from "react";
import { connect } from "react-redux";

import { GetIconComponent, historyPush, withModulesManager, withHistory } from "@openimis/fe-core";
import PaymentPage from "./PaymentPage";
const EditIcon = GetIconComponent("Edit")


class PaymentOverviewPage extends Component {
    render() {
        const { history, modulesManager, payment_uuid } = this.props;
        var actions = [{
            doIt: e => historyPush(modulesManager, history, "payment.paymentOverview", [payment_uuid]),
            icon: <EditIcon />,
            onlyIfDirty: false
        }]
        return <PaymentPage {...this.props} readOnly={true} overview={true} actions={actions} />
    }
}

const mapStateToProps = (state, props) => ({
    payment_uuid: props.match.params.payment_uuid,
})

export { PaymentOverviewPage };

export default withHistory(withModulesManager(connect(mapStateToProps)(PaymentOverviewPage)));
