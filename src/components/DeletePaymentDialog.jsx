import React, { Component } from "react";
import { styled } from "@mui/material/styles";

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';

import { FormattedMessage, injectIntl } from "@openimis/fe-core";

const StyledDeletePaymentDialog = styled('div')(({ theme }) => ({
  '& .primaryButton': theme.dialog?.primaryButton ?? {},
  '& .secondaryButton': theme.dialog?.secondaryButton ?? {},
}));

class DeletePaymentDialog extends Component {

    render() {
        const { payment, onCancel, onConfirm } = this.props;
        return (
            <StyledDeletePaymentDialog>
                <Dialog
                    open={!!payment}
                    onClose={onCancel}
                >
                    <DialogTitle>
                        <FormattedMessage
                            module="payment"
                            id="deletePaymentDialog.title"
                        />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <FormattedMessage
                                module="payment"
                                id="deletePaymentDialog.message"
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={e => onConfirm()} className="primaryButton" autoFocus>
                            <FormattedMessage module="payment" id="deletePaymentDialog.yes.button" />
                        </Button>
                        <Button onClick={onCancel} className="secondaryButton" >
                            <FormattedMessage module="core" id="cancel"/>
                        </Button>
                    </DialogActions>
                </Dialog>
            </StyledDeletePaymentDialog>
        )
    }
}

export { StyledDeletePaymentDialog };
export default injectIntl(DeletePaymentDialog);