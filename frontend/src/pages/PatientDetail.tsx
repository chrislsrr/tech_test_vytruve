import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { fileService } from '../services/fileService';
import UploadFileModal from '../components/UploadFileModal';
import type { Patient } from '../services/patientService';
import type { FileEntity } from '../services/fileService';

function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchPatient = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await patientService.getById(id);
      setPatient(data);
      setFormData(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch patient');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    if (!id) return;
    try {
      setFilesLoading(true);
      const data = await fileService.getByPatient(id);
      setFiles(data);
      setFilesError(null);
    } catch (err: any) {
      setFilesError(err.response?.data?.message || 'Failed to fetch files');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileUploaded = () => {
    fetchFiles();
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!id) return;
    try {
      await fileService.delete(id, fileId);
      fetchFiles();
    } catch (err: any) {
      setFilesError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  useEffect(() => {
    fetchPatient();
    fetchFiles();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await patientService.update(id, formData);
      fetchPatient();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading patient...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/patients')}>Back to patients</button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Patient not found</p>
        <button onClick={() => navigate('/patients')}>Back to patients</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Patient Details</h1>
        <button onClick={() => navigate('/patients')}>Back to list</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
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
              value={formData.firstName || ''}
              onChange={handleChange}
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
              value={formData.age || 0}
              onChange={handleChange}
              min={0}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/patients')}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Files</h2>
          <button onClick={() => setIsUploadModalOpen(true)}>Ajouter un fichier</button>
        </div>

        {filesError && <p style={{ color: 'red' }}>{filesError}</p>}

        {filesLoading ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files found for this patient</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Size (MB)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{file.originalName || file.name || 'Unknown'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {((file.fileSize || 0) / 1024 / 1024).toFixed(2)}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      type="button"
                      style={{ backgroundColor: '#ff4444', color: 'white' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patientId={id || ''}
          onFileUploaded={handleFileUploaded}
        />
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
              if (!id) return;
              try {
                await patientService.delete(id);
                navigate('/patients');
              } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete patient');
              }
            }
          }}
          type="button"
          style={{ 
            backgroundColor: '#ff4444', 
            color: 'white', 
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Supprimer Patient
        </button>
      </div>
    </div>
  );
}

export default PatientDetail;
