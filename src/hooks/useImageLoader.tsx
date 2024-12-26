import { useState, useEffect } from 'react';

export const useImageLoader = (imageUrl?: string) => {
  const [imgLoading, setImageLoading] = useState<boolean>(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
    setImageLoading(true);
  }, [imageUrl]);

  const handleImageLoad = () => {
    setTimeout(() => {
      setImageLoading(false);
    });
  };

  const isImageLoading = !!imageUrl && imgLoading && !imgError;
  const isImageReady = !!imageUrl && !imgError;

  return {
    isImageLoading,
    isImageReady,
    imgError,
    handleImageLoad,
    setImgError,
  };
};
