//import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


interface Address {
  fullName: string;
  house: string;
  street: string;
  thana: string;
  district: string;
  city: string;
  phone: string;
  landmark?: string;
}

interface AlertDialogProps {
  open: boolean;
  address: Address;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AlertDialog({ open, address, onClose, onConfirm }: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
        <div className='px-16 pt-8 py-2'>
                  <DialogTitle id="alert-dialog-title" className="flex items-center gap-2">
        
        Confirm Cash on Delivery
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to proceed with Cash on Delivery?
        </DialogContentText>
        <div className="text-sm text-gray-600 mt-4 ">
          <p><strong>Delivery Address:</strong></p>
          <p>{address.fullName}</p>
          <p>{address.house}, {address.street}</p>
          <p>{address.thana}, {address.district}, {address.city}</p>
          <p><strong>Phone:</strong> {address.phone}</p>
          {address.landmark && <p><strong>Landmark:</strong> {address.landmark}</p>}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
        </div>
    </Dialog>
  );
}