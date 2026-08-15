import { useState } from 'react';
import Modal from './Modal';
import { fileService } from '../services/fileService';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onFileUploaded: () => void;
}

function UploadFileModal({ isOpen, onClose, patientId, onFileUploaded }: UploadFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validation : uniquement .ply
      if (!selectedFile.name.endsWith('.ply')) {
        setError('Only .ply files are allowed');
        setFile(null);
        return;
      }
      
      // Validation : max 20Mo (20 * 1024 * 1024 bytes)
      const MAX_SIZE = 20 * 1024 * 1024;
      if (selectedFile.size > MAX_SIZE) {
        setError('File size must be less than 20MB');
        setFile(null);
        return;
      }
      
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await fileService.upload(patientId, file);
      onFileUploaded();
      onClose();
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload PLY File">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={{ marginBottom: '15px' }}>
          <label>
            Select .ply file (max 20MB):
            <input
              type="file"
              accept=".ply"
              onChange={handleFileChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
          {file && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              <p>Selected: {file.name}</p>
              <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={handleReset} disabled={isSubmitting}>
            Clear
          </button>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || !file}>
            {isSubmitting ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UploadFileModal;
