import { useState, useRef } from 'react';
import { chatService } from '../api/chatService';
import { useToast } from '../context/ToastContext';

export const useFileUpload = () => {
  const [previewFile, setPreviewFile] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const { showError, showWarning } = useToast();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile({
        file: file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPreviewFile({
        file: file,
        url: URL.createObjectURL(file),
        type: 'image'
      });
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let address = '';
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            address = data.display_name || '';
          } catch (error) {
            console.error('Geocoding error:', error);
          }
          
          setLocationData({ latitude, longitude, address });
        },
        (error) => {
          console.error('Geolocation error:', error);
          showError('Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.');
        }
      );
    } else {
      showWarning('Trình duyệt không hỗ trợ lấy vị trí');
    }
  };

  const removePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setLocationData(null);
  };

  const uploadFile = async () => {
    if (!previewFile) return null;

    try {
      setUploading(true);
      const uploadResult = await chatService.uploadFile(previewFile.file);
      const fileUrl = uploadResult.file.url;
      const messageType = uploadResult.file.type;
      const messageContent = uploadResult.file.originalName || previewFile.file.name || 'Đã gửi file';
      
      setPreviewFile(null);
      setUploading(false);
      
      return { fileUrl, messageType, messageContent };
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      throw error;
    }
  };

  return {
    previewFile,
    locationData,
    uploading,
    fileInputRef,
    imageInputRef,
    handleFileSelect,
    handleImageSelect,
    handleLocationClick,
    removePreview,
    uploadFile,
    setPreviewFile,
    setLocationData
  };
};

