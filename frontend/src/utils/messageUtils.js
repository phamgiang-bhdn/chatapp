export const handleDownloadFile = async (fileUrl, filename) => {
  try {
    let downloadFilename = filename;
    
    if (!downloadFilename.includes('.')) {
      const urlMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (urlMatch) {
        downloadFilename = `${downloadFilename}.${urlMatch[1]}`;
      } else {
        const contentType = await fetch(fileUrl, { method: 'HEAD' })
          .then(res => res.headers.get('content-type'))
          .catch(() => null);
        
        if (contentType) {
          const extensionMap = {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-excel': 'xls',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'text/plain': 'txt',
            'application/zip': 'zip'
          };
          const ext = extensionMap[contentType];
          if (ext) {
            downloadFilename = `${downloadFilename}.${ext}`;
          }
        }
      }
    }

    const apiUrl = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8000';
    const downloadUrl = `${apiUrl}/api/chat/download?fileUrl=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(downloadFilename)}`;
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    window.open(fileUrl, '_blank');
  }
};

