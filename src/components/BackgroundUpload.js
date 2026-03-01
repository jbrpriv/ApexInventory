import { useState, useRef } from 'react';
import { uploadBackground, resetBackground } from '../api';
import toast from 'react-hot-toast';

export default function BackgroundUpload({ currentUrl, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return toast.error('Only JPG, PNG, or WEBP allowed');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadBackground(formData);
      toast.success('Background updated!');
      onUpdate(res.data.url);
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetBackground();
      toast.success('Background reset to default');
      onUpdate(null);
      setOpen(false);
    } catch {
      toast.error('Failed to reset');
    }
  };

  return (
    <>
      <button className="btn-bg-settings" onClick={() => setOpen(true)} title="Background Settings">
        🖼
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal bg-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Background Image</h2>
              <button className="modal-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="bg-modal-body">
              {currentUrl && (
                <div className="bg-preview">
                  <img src={currentUrl} alt="Current background" />
                  <span className="bg-preview-label">Current background</span>
                </div>
              )}

              <div className="bg-actions">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
                <button
                  className="btn-upload"
                  onClick={() => fileRef.current.click()}
                  disabled={uploading}
                >
                  {uploading ? '⏳ Uploading to Cloudinary...' : '📤 Upload New Background'}
                </button>

                {currentUrl && (
                  <button className="btn-reset-bg" onClick={handleReset}>
                    🗑 Reset to Default
                  </button>
                )}
              </div>

              <p className="bg-hint">Supported: JPG, PNG, WEBP · Max 10MB · Hosted on Cloudinary</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
