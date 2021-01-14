import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay"
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush,
    Form, ProgressOrError, journalize, coreConfirm
} from "@openimis/fe-core";
import { RIGHT_PAYMENT, RIGHT_PAYMENT_EDIT } from "../constants";
// import FamilyMasterPanel from "./FamilyMasterPanel";

import { fetchPayment, newPayment, createPayment } from "../actions";
// import FamilyInsureesOverview from "./FamilyInsureesOverview";
import PaymentMasterPanel from "./PaymentMasterPanel";

// import { insureeLabel } from "../utils/utils";

const styles = theme => ({
    lockedPage: theme.page.locked
});

const INSUREE_FAMILY_PANELS_CONTRIBUTION_KEY = "insuree.Family.panels"
const INSUREE_FAMILY_OVERVIEW_PANELS_CONTRIBUTION_KEY = "insuree.FamilyOverview.panels"
const INSUREE_FAMILY_OVERVIEW_CONTRIBUTED_MUTATIONS_KEY = "insuree.FamilyOverview.mutations"

class PaymentForm extends Component {

    state = {
        lockNew: false,
        reset: 0,
        constribution: this._newContribution(),
        newPayment: true,
        consirmedAction: null,
    }

    _newContribution() {
        return {
            jsonExt: {},
        };
    }

    componentDidMount() {
        document.title = formatMessageWithValues(
            this.props.intl,
            "payment",
            "PaymentOverview.title",
            { label: "" }
        );
        if (this.props.payment_uuid) {
            this.setState(
                (state, props) => ({ payment_uuid: props.payment_uuid }),
                e => this.props.fetchPayment(
                    this.props.modulesManager,
                    this.props.payment_uuid
                )
            )
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if ((prevState.payment && prevState.payment.headInsuree && prevState.payment.headInsuree.chfId)
        //     !== (this.state.payment && this.state.payment.headInsuree && this.state.payment.headInsuree.chfId)) {
        //     document.title = formatMessageWithValues(this.props.intl, "insuree", !!this.props.overview ? "FamilyOverview.title" : "Family.title", { label: insureeLabel(this.state.payment.headInsuree) })
        // }
        if (!prevProps.fetchedPayment && !!this.props.fetchedPayment) {
            const { payment } = this.props;
            payment.ext = !!payment.jsonExt ? JSON.parse(payment.jsonExt) : {};
            this.setState(
            {
                payment,
                payment_uuid: payment.uuid,
                lockNew: false,
                newPayment: false
            });
        } else if (prevProps.payment_uuid && !this.props.payment_uuid) {
            // document.title = formatMessageWithValues(this.props.intl, "insuree", !!this.props.overview ? "FamilyOverview.title" : "Family.title", { label: insureeLabel(this.state.payment.headInsuree) })
            this.setState({ payment: this._newContribution(), newPayment: true, lockNew: false, payment_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState((state, props) => ({
                payment: { ...state.payment, clientMutationId: props.mutation.clientMutationId }
            }));
        } else if (prevProps.confirmed !== this.props.confirmed && !!this.props.confirmed && !!this.state.confirmedAction) {
            this.state.confirmedAction();
        }
    }

    // _add = () => {
    //     this.setState((state) => ({
    //         family: this._newFamily(),
    //         newPayment: true,
    //         lockNew: false,
    //         reset: state.reset + 1,
    //     }),
    //         e => {
    //             this.props.add();
    //             this.forceUpdate();
    //         }
    //     )
    // }

    // reload = () => {
    //     this.props.fetchPayment(
    //         this.props.modulesManager,
    //         this.state.family_uuid,
    //         !!this.state.family.headInsuree ? this.state.family.headInsuree.chfId : null
    //     );
    // }

    canSave = () => {
        if (!this.state.payment.payType) return false;
        return true;
    }

    // _save = (family) => {
    //     this.setState(
    //         { lockNew: !family.uuid }, // avoid duplicates
    //         e => this.props.save(family))
    // }

    onEditedChanged = payment => {
        this.setState({ payment, newPayment: false })
    }

    onActionToConfirm = (title, message, confirmedAction) => {
        this.setState(
            { confirmedAction },
            this.props.coreConfirm(
                title,
                message
            )
        )
    }

    render() {
        const {
            modulesManager,
            classes,
            state,
            rights,
            payment_uuid,
            fetchingContribution,
            fetchedPayment,
            errorContribution,
            insuree,
            overview = false, openFamilyButton, readOnly = false,
            add, save, back, mutation } = this.props;
        const { payment } = this.state;
        console.log('payment', payment)
        if (!rights.includes(RIGHT_PAYMENT)) return null;
        const runningMutation = !!payment && !!payment.clientMutationId
        // let contributedMutations = modulesManager.getContribs(INSUREE_FAMILY_OVERVIEW_CONTRIBUTED_MUTATIONS_KEY);
        // for (let i = 0; i < contributedMutations.length && !runningMutation; i++) {
        //     runningMutation = contributedMutations[i](state)
        // }
        const actions = [{
            doIt: this.reload,
            icon: <ReplayIcon />,
            onlyIfDirty: !readOnly && !runningMutation
        }];
        return (
            <div className={!!runningMutation ? classes.lockedPage : null}>
                <ProgressOrError progress={fetchingContribution} error={errorContribution} />
                {((!!fetchedPayment && !!payment && payment.uuid === payment_uuid) || !payment_uuid) && (
                    <Form
                        module="payment"
                        title="PaymentOverview.title"
                        edited_id={payment_uuid}
                        edited={payment}
                        reset={this.state.reset}
                        back={back}
                        add={!!add && !this.state.newPayment ? this._add : null}
                        readOnly={readOnly || runningMutation || !!payment.validityTo}
                        actions={actions}
                        // openFamilyButton={openFamilyButton}
                        overview={overview}
                        HeadPanel={PaymentMasterPanel}
                        // Panels={overview ? [FamilyInsureesOverview] : [HeadInsureeMasterPanel]}
                        // contributedPanelsKey={overview ? INSUREE_FAMILY_OVERVIEW_PANELS_CONTRIBUTION_KEY : INSUREE_FAMILY_PANELS_CONTRIBUTION_KEY}
                        payment={payment}
                        onEditedChanged={this.onEditedChanged}
                        canSave={this.canSave}
                        save={!!save ? this._save : null}
                        onActionToConfirm={this.onActionToConfirm}
                    />
                )}
            </div>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    fetchingContribution: state.payment.fetchingContribution,
    errorContribution: state.payment.errorContribution,
    fetchedPayment: state.payment.fetchedPayment,
    submittingMutation: state.payment.submittingMutation,
    mutation: state.payment.mutation,
    payment: state.payment.payment,
    confirmed: state.core.confirmed,
    state: state,
})

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchPayment, newPayment, createPayment, journalize, coreConfirm }, dispatch);
};

export default withHistory(withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(PaymentForm))
    ))));