import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../ui/LoadingSpinner'; 
// MUI Imports
import {
  Box,
  SwipeableDrawer,
  Button,
  List,
  Divider,
  ListItem,
  Typography,
  IconButton,
  Paper,
  Container,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Pagination,
  useTheme,
  useMediaQuery,
  Badge,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';

import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  RateReview as ReviewIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import ConfirmationDialog from '../ui/Confirm';
import FormDialog from '../ui/ProductEditDilogBox';
import type { Products as Product, Reviews as Review } from '../types';

// API Response interfaces
interface ProductsApiResponse {
  products: Product[];
  totalProducts: number;
  totalPages: number;
}

// API functions
const fetchProducts = async (page: number, limit: number, search: string = ''): Promise<ProductsApiResponse> => {
  const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/fetchProducts`, {
    params: { page, limit, search: search.trim() },
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

const updateProduct = async (productData: { id: string; data: Partial<Product> }) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_APP_API_URL}/api/updateProduct/${productData.id}`,
    productData.data,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

const deleteProduct = async (productId: string) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_APP_API_URL}/api/deleteProduct/${productId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

const ManageProducts: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProductReviews, setSelectedProductReviews] = useState<Review[]>([]);
  const [selectedProductName, setSelectedProductName] = useState<string>('');

  // Confirmation Dialog State
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);

  // For Edit Product
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // React Query for fetching products
  const {
    data: productsData,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery<ProductsApiResponse, Error>({
    queryKey: ['products', page, rowsPerPage, searchQuery],
    queryFn: () => fetchProducts(page, rowsPerPage, searchQuery),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });


  // Update Product Mutation with Instant Cache Update & Background Sync
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (_res: any, variables: { id: string; data: Partial<Product> }) => {
      queryClient.setQueryData<ProductsApiResponse>(
        ['products', page, rowsPerPage],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            products: oldData.products.map((p) =>
              p._id === variables.id
                ? {
                    ...p,
                    ...variables.data,
                    discount:
                      variables.data.oldPrice && variables.data.price && variables.data.oldPrice > variables.data.price
                        ? Math.round(((variables.data.oldPrice - variables.data.price) / variables.data.oldPrice) * 100)
                        : 0
                  }
                : p
            )
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showNotification("Product updated successfully!", 'success');
      setEditDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      showNotification(
        error?.response?.data?.message || "Failed to update product",
        'error'
      );
    }
  });

  // Delete Product Mutation with Instant Cache Update
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_res: any, deletedId: string) => {
      queryClient.setQueryData<ProductsApiResponse>(
        ['products', page, rowsPerPage],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            totalProducts: Math.max(0, (oldData.totalProducts || oldData.products.length) - 1),
            products: oldData.products.filter((p) => p._id !== deletedId)
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showNotification("Product deleted successfully!", 'success');
      setConfirmDialogOpen(false);
      setProductIdToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error deleting product:", error);
      showNotification(
        error?.response?.data?.message || "Failed to delete product",
        'error'
      );
    }
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1); // Reset to first page
  };

  const toggleDrawer = (open: boolean, reviews: Review[] = [], productName: string = '') => {
    setDrawerOpen(open);
    if (open) {
      setSelectedProductReviews(reviews);
      setSelectedProductName(productName);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleSaveProduct = async (editedProduct: Product) => {
    await updateProductMutation.mutateAsync({
      id: editedProduct._id,
      data: {
        name: editedProduct.name,
        price: editedProduct.price,
        oldPrice: editedProduct.oldPrice,
        description: editedProduct.description,
        category: editedProduct.category,
        inStock: editedProduct.inStock,
        images: editedProduct.images
      }
    });
  };

  const handleDeleteProductClick = (productId: string) => {
    setProductIdToDelete(productId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productIdToDelete) {
      deleteProductMutation.mutate(productIdToDelete);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setProductIdToDelete(null);
  };

  const drawerContent = () => (
    <Box
      sx={{ 
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        maxHeight: '80vh',
        p: { xs: 2, sm: 3 },
        overflow: 'auto'
      }}
      role="presentation"
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        position: 'sticky',
        top: 0,
        backgroundColor: 'background.paper',
        zIndex: 1
      }}>
        <Typography variant="h6" noWrap>
          Reviews: {selectedProductName}
        </Typography>
        <IconButton onClick={() => toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      {selectedProductReviews.length > 0 ? (
        <List sx={{ pt: 2 }}>
          {selectedProductReviews.map((reviewItem) => (
            <Paper key={reviewItem._id} elevation={2} sx={{ mb: 2, p: 2 }}>
              <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', p: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
                  <Avatar
                    src={reviewItem.userId.imgUrl}
                    alt={reviewItem.userId.name}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {reviewItem.userId.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {reviewItem.userId.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reviewItem.userId.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StarIcon color="warning" fontSize="small" />
                    <Typography variant="body2" ml={0.5}>
                      {reviewItem.rating}/5
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mb: 2, lineHeight: 1.6 }}
                >
                  {reviewItem.review}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Chip 
                    label={`${reviewItem.likes} likes`} 
                    size="small" 
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(reviewItem.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          py: 4 
        }}>
          <ReviewIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No reviews for this product yet
          </Typography>
        </Box>
      )}
    </Box>
  );

  

  // Loading state
  if (isLoading && !productsData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSpinner message="Loading products..." className="mt-20" />
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : "Failed to load products"}
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Try Again
        </Button>
      </Container>
    );
  }

  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 0;

  return (
    <Box sx={{ width: '100%', py: { xs: 1, sm: 2 }, px: { xs: 0.5, sm: 1 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          fontWeight="bold"
        >
          Manage Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Total: {productsData?.totalProducts ?? products.length} products
          {searchQuery && ` (filtered for "${searchQuery}")`}
        </Typography>
      </Box>

      {/* Controls */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 3 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <TextField
          size="small"
          placeholder="Search products by name, category, brand..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 280, md: 360 }, flex: { md: 1 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchInput ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchInput('')} edge="end" aria-label="Clear search">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Products per page</InputLabel>
          <Select
            value={rowsPerPage}
            label="Products per page"
            onChange={handleRowsPerPageChange as any}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Stack>

      {/* Empty State */}
      {products.length === 0 && !isLoading && (
        <Paper sx={{ p: 5, textAlign: 'center', my: 4, borderRadius: 2 }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {searchQuery ? `No products found matching "${searchQuery}"` : "No products found"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchQuery ? "Try searching for another keyword, brand, or category" : "Start by adding some products to your inventory"}
          </Typography>
          {searchQuery && (
            <Button variant="outlined" size="small" onClick={() => setSearchInput('')}>
              Clear Search
            </Button>
          )}
        </Paper>
      )}

      {/* Products Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
  {products.map((product: Product) => (
    <div key={product._id} className="h-full flex flex-col">
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              {/* Product Image */}
              {product.images && product.images.length > 0 ? (
                <CardMedia
                  component="img"
                  sx={{ 
                    height: { xs: 180, sm: 200 }, 
                    objectFit: 'cover',
                    bgcolor: 'grey.100'
                  }}
                  image={product.images[0]}
                  alt={product.name}
                />
              ) : (
                <Box
                  sx={{ 
                    height: { xs: 180, sm: 200 }, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'grey.400'
                  }}
                >
                  <ShoppingCartIcon sx={{ fontSize: 48 }} />
                </Box>
              )}
              
              <CardContent sx={{ flex: 1, pb: 1 }}>
                {/* Product Name */}
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.2,
                    minHeight: '2.4em'
                  }}
                >
                  {product.name}
                </Typography>

                {/* Price Section */}
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${product.price}
                    </Typography>
                    {product.oldPrice > product.price && (
                      <>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ${product.oldPrice}
                        </Typography>
                        <Chip 
                          label={`-${product.discount}%`}
                          color="error"
                          size="small"
                        />
                      </>
                    )}
                  </Stack>
                </Box>

                {/* Category & Stock */}
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={product.category}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={product.inStock ? 'In Stock' : 'Out of Stock'}
                    color={product.inStock ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    mb: 2
                  }}
                >
                  {product.description}
                </Typography>

                {/* Reviews */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Badge badgeContent={product.reviews.length} color="primary">
                    <IconButton 
                      size="small"
                      onClick={() => toggleDrawer(true, product.reviews, product.name)}
                      sx={{ p: 0.5 }}
                    >
                      <ReviewIcon fontSize="small" />
                    </IconButton>
                  </Badge>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditProduct(product)}
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteProductClick(product._id)}
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardActions>
            </Card>
    </div>
  ))}
</div>

      {/* Loading overlay for mutations */}
      {(updateProductMutation.isPending || deleteProductMutation.isPending) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <LoadingSpinner />
            <Typography>
              {updateProductMutation.isPending ? 'Updating product...' : 'Deleting product...'}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Swipeable Drawer for Reviews */}
<SwipeableDrawer
  anchor="bottom"
  open={drawerOpen}
  onClose={() => toggleDrawer(false)}
  onOpen={() => toggleDrawer(true, selectedProductReviews, selectedProductName)}
  disableSwipeToOpen={false}
  ModalProps={{
    keepMounted: true,
  }}
  PaperProps={{
    sx: {
      width: '100%',
      maxWidth: 800,
      mx: 'auto',
      borderTopLeftRadius: { xs: 12, sm: 16 },
      borderTopRightRadius: { xs: 12, sm: 16 },
      maxHeight: '85vh',
    }
  }}
>
  {drawerContent()}
</SwipeableDrawer>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      {/* Edit Product Dialog */}
      <FormDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        isSubmitting={updateProductMutation.isPending}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.show}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageProducts;