'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Loader2 } from 'lucide-react';
import axios from 'axios';

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

export default function ImagesPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery?published=true`);
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600 mt-2">Moments from our blood donation events and facilities</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No images available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <Card key={img.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
                  <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                    <img
                      src={`${API_URL}${img.imageUrl}`}
                      alt={img.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/800x600/ef4444/ffffff?text=${encodeURIComponent(img.title)}`;
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{img.title}</h3>
                    <p className="text-sm text-gray-600">{img.description || ''}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
