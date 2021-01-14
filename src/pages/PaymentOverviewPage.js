import React, { Component } from "react";
import { connect } from "react-redux";
import { Edit as EditIcon } from "@material-ui/icons";
import { historyPush, withModulesManager, withHistory } from "@openimis/fe-core";
import PaymentPage from "./PaymentPage";


class PaymentOverviewPage extends Component {
    render() {
        const { history, modulesManager, payment_uuid } = this.props;
        var actions = [{
            doIt: e => historyPush(modulesManager, history, "insuree.route.family", [payment_uuid]),
            icon: <EditIcon />,
            onlyIfDirty: false
        }]
        return <PaymentPage {...this.props} readOnly={true} overview={true} actions={actions} />
    }
}

const mapStateToProps = (state, props) => ({
    payment_uuid: props.match.params.contribution_uuid,
})

export default withHistory(withModulesManager(connect(mapStateToProps)(PaymentOverviewPage)));