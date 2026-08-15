import { useState } from 'react';
import Modal from './Modal';
import { patientService } from '../services/patientService';
import type { CreatePatientDto } from '../services/patientService';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: () => void;
}

function CreatePatientModal({ isOpen, onClose, onPatientCreated }: CreatePatientModalProps) {
  const [formData, setFormData] = useState<CreatePatientDto>({
    lastName: '',
    firstName: '',
    age: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await patientService.create(formData);
      onPatientCreated();
      onClose();
      setFormData({ lastName: '', firstName: '', age: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Patient">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '15px' }}>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Dupont"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jean"
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="45"
              min={0}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreatePatientModal;
