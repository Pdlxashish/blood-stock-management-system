'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Image as ImageIcon, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Crop,
  Plus,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuthStore } from '@/lib/store';
import axiosInstance from '@/lib/axiosInstance';

// Define types locally to avoid import issues
type CropType = {
  unit?: 'px' | '%';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type PixelCropType = {
  unit: 'px';
  x: number;
  y: number;
  width: number;
  height: number;
};

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function GalleryManagementPage() {
  const { token, user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Check admin status after hydration
  useEffect(() => {
    if (!_hasHydrated) {
      console.log('Waiting for auth store to hydrate...');
      return;
    }
    
    const adminStatus = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF');
    setIsAdmin(adminStatus);
    console.log('Auth State (after hydration):', { 
      _hasHydrated,
      isAuthenticated, 
      user, 
      token: !!token, 
      isAdmin: adminStatus 
    });
  }, [_hasHydrated, isAuthenticated, user, token]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Crop states
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCropType>();
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axiosInstance.get('/api/gallery');
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP, AVIF, SVG)');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !title) {
      toast.error('Please provide a title and select an image');
      return;
    }

    if (!token || !isAdmin) {
      toast.error('Please login as admin to upload images');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isPublished', isPublished.toString());

    try {
      await axiosInstance.post('/api/gallery', formData);

      toast.success('Image uploaded successfully');
      setUploadDialogOpen(false);
      resetForm();
      fetchImages();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !title) {
      toast.error('Please provide a title');
      return;
    }

    if (!token) {
      toast.error('You must be logged in to edit images');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isPublished', isPublished.toString());

    try {
      await axiosInstance.put(`/api/gallery/${selectedImage.id}`, formData);

      toast.success('Image updated successfully');
      setEditDialogOpen(false);
      resetForm();
      fetchImages();
    } catch (error: any) {
      console.error('Error updating image:', error);
      toast.error(error.response?.data?.message || 'Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    if (!token) {
      toast.error('You must be logged in to delete images');
      return;
    }

    try {
      await axiosInstance.delete(`/api/gallery/${id}`);

      toast.success('Image deleted successfully');
      fetchImages();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleTogglePublish = async (image: GalleryImage) => {
    if (!token) {
      toast.error('You must be logged in to update images');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('isPublished', (!image.isPublished).toString());

      await axiosInstance.put(`/api/gallery/${image.id}`, formData);

      toast.success(`Image ${!image.isPublished ? 'published' : 'unpublished'} successfully`);
      fetchImages();
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      toast.error(error.response?.data?.message || 'Failed to update image');
    }
  };

  const openEditDialog = (image: GalleryImage) => {
    setSelectedImage(image);
    setTitle(image.title);
    setDescription(image.description || '');
    setIsPublished(image.isPublished);
    setImagePreview(`${API_URL}${image.imageUrl}`);
    setEditDialogOpen(true);
  };

  const openCropDialog = (image: GalleryImage) => {
    setSelectedImage(image);
    setCropImageSrc(`${API_URL}${image.imageUrl}`);
    setCropDialogOpen(true);
  };

  const getCroppedImg = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropSave = async () => {
    if (!selectedImage) return;

    if (!token) {
      toast.error('You must be logged in to crop images');
      return;
    }

    const croppedFile = await getCroppedImg();
    if (!croppedFile) {
      toast.error('Failed to crop image');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', croppedFile);

    try {
      await axiosInstance.put(`/api/gallery/${selectedImage.id}`, formData);

      toast.success('Image cropped successfully');
      setCropDialogOpen(false);
      setSelectedImage(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
      fetchImages();
    } catch (error: any) {
      console.error('Error cropping image:', error);
      toast.error(error.response?.data?.message || 'Failed to crop image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setIsPublished(true);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while auth store is hydrating
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 text-white">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
            <p className="text-muted-foreground">
              Manage images for the public gallery page
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <span className="ml-2 text-xs">
                  (Auth: {isAuthenticated ? '✓' : '✗'}, Role: {user?.role || 'none'}, Admin: {isAdmin ? '✓' : '✗'})
                </span>
              )}
            </p>
          </div>
        </div>
        {isAdmin ? (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
        ) : (
          <Button onClick={() => window.location.href = '/auth/admin'} variant="outline">
            Login as Admin to Manage
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              {isAdmin ? 'Upload your first image to get started' : 'No images have been uploaded yet'}
            </p>
            {isAdmin && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-video bg-gray-200">
                <img
                  src={`${API_URL}${image.imageUrl}`}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/800x600/ef4444/ffffff?text=${encodeURIComponent(image.title)}`;
                  }}
                />
                {!image.isPublished && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Unpublished
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-1 truncate">{image.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {image.description || 'No description'}
                </p>
                {isAdmin && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(image);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(image)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openCropDialog(image)}
                    >
                      <Crop className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublish(image)}
                    >
                      {image.isPublished ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="upload-dialog-description">
          <DialogHeader>
            <DialogTitle>Upload New Image</DialogTitle>
          </DialogHeader>
          <p id="upload-dialog-description" className="sr-only">
            Upload a new image to the gallery with title, description, and publish settings
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="upload-image">Image *</Label>
              <Input
                id="upload-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPEG, PNG, GIF, WEBP, AVIF, SVG (Max 10MB)
              </p>
            </div>
            {imagePreview && (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <Label htmlFor="upload-title">Title *</Label>
              <Input
                id="upload-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="upload-published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="upload-published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="edit-dialog-description">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <p id="edit-dialog-description" className="sr-only">
            Edit the image details including title, description, and publish status
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-image">Replace Image (Optional)</Label>
              <Input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            {imagePreview && (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="edit-published" className="cursor-pointer">
                Published
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-4xl" aria-describedby="crop-dialog-description">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <p id="crop-dialog-description" className="sr-only">
            Crop the image by selecting the desired area
          </p>
          <div className="space-y-4">
            {cropImageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imgRef}
                  src={cropImageSrc}
                  alt="Crop"
                  style={{ maxHeight: '500px' }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCropDialogOpen(false);
              setSelectedImage(null);
              setCrop(undefined);
              setCompletedCrop(undefined);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCropSave} disabled={uploading || !completedCrop}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Cropped Image'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl" aria-describedby="preview-dialog-description">
          {selectedImage && (
            <div className="space-y-4">
              <p id="preview-dialog-description" className="sr-only">
                Preview of {selectedImage.title}
              </p>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={`${API_URL}${selectedImage.imageUrl}`}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                <p className="text-muted-foreground mb-2">
                  {selectedImage.description || 'No description'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedImage.isPublished ? (
                    <span className="text-green-600 font-semibold">Published</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Unpublished</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
