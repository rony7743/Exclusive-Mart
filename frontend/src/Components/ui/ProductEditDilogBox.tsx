import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import type { Products as Product } from '../types';
import axios from 'axios';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (editedProduct: Product) => Promise<void>;
  product: Product | null;
  isSubmitting?: boolean;
}

export default function FormDialog({
  open,
  onClose,
  onSave,
  product,
  isSubmitting = false
}: FormDialogProps) {
  const [editedProduct, setEditedProduct] = React.useState<Product | null>(null);
  const [oldImages, setOldImages] = React.useState<string[]>([]);
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setOldImages(product.images || []);
      setNewImages([]);
      setNewImagePreviews([]);
      setErrorMessage(null);
      setIsUploading(false);
    }
  }, [product]);

  if (!editedProduct) return null;

  const isBusy = isSubmitting || isUploading;

  // Handle new image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(
        file => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
      );
      if (validFiles.length !== files.length) {
        alert('Only image files less than 5MB are allowed.');
      }
      if (validFiles.length > 0) {
        setNewImages(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prev => [...prev, ...newPreviews]);
        setErrorMessage(null);
      }
    }
    // reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove image (old or new)
  const removeImage = (index: number) => {
    if (index < oldImages.length) {
      // Remove from old images
      setOldImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove from new images and previews
      const newIndex = index - oldImages.length;
      URL.revokeObjectURL(newImagePreviews[newIndex]);
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
      setNewImagePreviews(prev => prev.filter((_, i) => i !== newIndex));
    }
  };

  const handleSave = async () => {
    if (!editedProduct) return;
    
    if (!editedProduct.name?.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }

    if (oldImages.length === 0 && newImages.length === 0) {
      setErrorMessage('Product must have at least one image. Please add an image.');
      return;
    }

    try {
      setErrorMessage(null);
      setIsUploading(true);
      let newImageUrls: string[] = [];

      if (newImages.length > 0) {
        const formDataToSend = new FormData();
        newImages.forEach((file) => {
          formDataToSend.append('images', file);
        });

        const imageUploadResponse = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/api/image`,
          formDataToSend
        );

        if (imageUploadResponse.data.imageUrls && imageUploadResponse.data.imageUrls.length > 0) {
          newImageUrls = imageUploadResponse.data.imageUrls;
        } else {
          throw new Error('Failed to upload images. Please check your image format and try again.');
        }
      }

      const updatedProduct: Product = {
        ...editedProduct,
        images: [...oldImages, ...newImageUrls],
        price: Number(editedProduct.price),
        oldPrice: Number(editedProduct.oldPrice || 0)
      };

      await onSave(updatedProduct);

      // Clean up previews after successful save
      newImagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setNewImages([]);
      setNewImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Error saving product:', error);
      setErrorMessage(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to save product. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isBusy ? undefined : onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: { xs: 1, sm: 2 } }
      }}
    >
      <DialogTitle sx={{ pr: 6, fontWeight: 'bold' }}>
        Edit Product: {editedProduct.name || 'Untitled'}
        {!isBusy && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers>
        {errorMessage && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fee2e2', color: '#b91c1c', borderRadius: 1, fontSize: 14 }}>
            {errorMessage}
          </Box>
        )}

        <div className="space-y-4">
          <TextField
            margin="dense"
            label="Product Name *"
            fullWidth
            value={editedProduct.name}
            onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
            disabled={isBusy}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              margin="dense"
              label="Price ($) *"
              type="number"
              fullWidth
              value={editedProduct.price}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: Math.max(0, Number(e.target.value)) })}
              disabled={isBusy}
            />
            <TextField
              margin="dense"
              label="Old Price ($)"
              type="number"
              fullWidth
              value={editedProduct.oldPrice || ''}
              onChange={(e) => setEditedProduct({ ...editedProduct, oldPrice: Math.max(0, Number(e.target.value)) })}
              disabled={isBusy}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <TextField
              margin="dense"
              label="Category"
              fullWidth
              value={editedProduct.category}
              onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
              disabled={isBusy}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editedProduct.inStock}
                  onChange={(e) => setEditedProduct({ ...editedProduct, inStock: e.target.checked })}
                  disabled={isBusy}
                  color="success"
                />
              }
              label={editedProduct.inStock ? "In Stock (Available)" : "Out of Stock"}
              sx={{ mt: 1 }}
            />
          </div>

          <TextField
            margin="dense"
            label="Description"
            multiline
            rows={3}
            fullWidth
            value={editedProduct.description || ''}
            onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
            disabled={isBusy}
          />

          {/* Images Management Section */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Product Images ({oldImages.length + newImages.length})
              </Typography>
              
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  disabled={isBusy}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                >
                  Upload New Images
                </Button>
              </div>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              The first image is used as the primary thumbnail in the store. Click &times; to remove any image.
            </Typography>

            {/* Images Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: 1.5,
              mt: 1
            }}>
              {[...oldImages, ...newImagePreviews].map((preview, index) => {
                const isOld = index < oldImages.length;
                const isPrimary = index === 0;

                return (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      paddingTop: '100%',
                      border: isPrimary ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: '#f8fafc',
                    }}
                  >
                    <img
                      src={preview}
                      alt={`Product image ${index + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <Chip
                        label="Primary"
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          height: 18,
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}
                      />
                    )}

                    {/* New Upload Badge */}
                    {!isOld && (
                      <Chip
                        label="New"
                        size="small"
                        color="success"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          height: 18,
                          fontSize: 10,
                        }}
                      />
                    )}

                    {/* Remove button */}
                    {!isBusy && (
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 22,
                          height: 22,
                          backgroundColor: 'rgba(0, 0, 0, 0.65)',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Box>

            {oldImages.length === 0 && newImages.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fff1f2', border: '1px dashed #f43f5e', borderRadius: 1 }}>
                <Typography color="error" variant="body2" fontWeight="medium">
                  No images left! Please click &quot;Upload New Images&quot; to add at least one photo.
                </Typography>
              </Box>
            )}
          </Box>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} disabled={isBusy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isBusy}
          startIcon={isBusy ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ minWidth: 120 }}
        >
          {isBusy ? (isUploading ? 'Uploading...' : 'Saving...') : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}