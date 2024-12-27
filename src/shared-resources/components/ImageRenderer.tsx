import React from 'react';
import Loader from './Loader/Loader';

interface ImageRendererProps {
  imageUrl: string;
  isImageLoading: boolean;
  isImageReady: boolean;
  imgError: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({
  imageUrl,
  isImageLoading,
  isImageReady,
  imgError,
  onImageLoad,
  onImageError,
}) => (
  <div className='min-h-20 flex items-center justify-center relative'>
    {isImageLoading && (
      <div className='absolute'>
        <Loader />
      </div>
    )}
    {isImageReady ? (
      <img
        className='w-auto min-w-[30%] max-w-full h-auto max-h-[80vh] !mb-6 object-contain'
        src={imageUrl}
        onLoad={onImageLoad}
        onError={onImageError}
        alt='Img'
      />
    ) : (
      imgError && (
        <div className='text-red-500 text-lg pb-10 mt-0'>
          Connectivity Error!! Unable to load the image.
        </div>
      )
    )}
  </div>
);
