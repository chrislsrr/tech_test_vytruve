import { useState } from 'react';
import Modal from './Modal';
import { printService } from '../services/printService';
import type { StartPrintJobDto } from '../services/printService';

interface StartPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  patientId: string;
  onPrintStarted: () => void;
}

function StartPrintModal({ isOpen, onClose, fileId, patientId, onPrintStarted }: StartPrintModalProps) {
  const [socketReference, setSocketReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocketReference(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!socketReference.trim()) {
      setError('Socket reference must be filled');
      return;
    }

    if (socketReference.length > 15) {
      setError('Socket reference must be MAX 15 chars');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const dto: StartPrintJobDto = {
      fileId,
      patientId,
      socketReference,
    };

    try {
      await printService.startPrintJob(dto);
      onPrintStarted();
      onClose();
      setSocketReference('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start print job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Print Job">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: '15px' }}>
          <label>
            Socket Reference (max 15 chars):
            <input
              type="text"
              value={socketReference}
              onChange={handleChange}
              required
              maxLength={15}
              placeholder="Enter socket reference"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || !socketReference.trim()}>
            {isSubmitting ? 'Starting...' : 'Start Print'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default StartPrintModal;
