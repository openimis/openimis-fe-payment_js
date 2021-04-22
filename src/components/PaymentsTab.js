import React, { Component } from "react";
import { Tab } from "@material-ui/core";
import { PublishedComponent, formatMessage } from "@openimis/fe-core";
import { PAYMENTS_TAB_VALUE } from "../constants";
import PaymentSearcher from "./PaymentSearcher";

class PaymentsTabLabel extends Component {
    render() {
        const { intl, onChange, disabled, tabStyle, isSelected } = this.props;
        return (
            <Tab
                onChange={onChange}
                disabled={disabled}
                className={tabStyle(PAYMENTS_TAB_VALUE)}
                selected={isSelected(PAYMENTS_TAB_VALUE)}
                value={PAYMENTS_TAB_VALUE}
                label={formatMessage(intl, "payment", "menu.payments")}
            />
        );
    }
}

class PaymentsTabPanel extends Component {
    render() {
        const { value, isTabsEnabled, additionalFilter } = this.props;
        return (
            <PublishedComponent
                pubRef="policyHolder.TabPanel"
                module="payment"
                index={PAYMENTS_TAB_VALUE}
                value={value}
            >
                {isTabsEnabled && (
                    <PaymentSearcher
                        additionalFilter={additionalFilter}
                        readOnly
                    />
                )}
            </PublishedComponent>
        );
    }
}

export {
    PaymentsTabLabel,
    PaymentsTabPanel
}
