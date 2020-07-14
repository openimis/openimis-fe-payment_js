import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { PAYMENT_STATUS } from "../constants";

class PaymentStatusTypePicker extends Component {

    render() {
        return <ConstantBasedPicker
            module="payment"
            label="payment.status"
            constants={PAYMENT_STATUS}
            {...this.props}
        />
    }
}

export default PaymentStatusTypePicker;