import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { multiLangLabels } from 'utils/constants/multiLangLabels.constants';
import MultiLangText from '../MultiLangText/MultiLangText';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  description,
  onClose,
  onConfirm,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby='shared-dialog-title'
    aria-describedby='shared-dialog-description'
    className='flex items-center justify-center'
  >
    <div className='bg-white rounded-lg p-6 w-[400px]'>
      <DialogTitle id='shared-dialog-title' className='text-xl font-bold'>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id='shared-dialog-description'
          className='text-gray-600 mb-4'
        >
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions className='flex justify-center gap-4'>
        <Button
          onClick={onClose}
          variant='outlined'
          className='border-blue-500 text-blue-500 px-4 py-2 rounded hover:border-blue-700'
        >
          <MultiLangText labelMap={multiLangLabels.cancel} />
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700'
        >
          <MultiLangText labelMap={multiLangLabels.confirm} />
        </Button>
      </DialogActions>
    </div>
  </Dialog>
);

export default ConfirmationDialog;
