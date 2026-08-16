import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { patientService } from '../services/patientService';
import { fileService } from '../services/fileService';
import { printService } from '../services/printService';
import UploadFileModal from '../components/UploadFileModal';
import StartPrintModal from '../components/StartPrintModal';
import type { Patient } from '../services/patientService';
import type { FileEntity } from '../services/fileService';
import type { PrintJob } from '../services/printService';

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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [printJobsLoading, setPrintJobsLoading] = useState(true);
  const [printJobsError, setPrintJobsError] = useState<string | null>(null);
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

  const handlePrintStarted = () => {
    fetchFiles();
    fetchPrintJobs();
  };

  const fetchPrintJobs = async () => {
    try {
      setPrintJobsLoading(true);
      const data = await printService.listPrintJobs();
      setPrintJobs(data);
      setPrintJobsError(null);
    } catch (err: any) {
      setPrintJobsError(err.response?.data?.message || 'Failed to fetch print jobs');
    } finally {
      setPrintJobsLoading(false);
    }
  };

  const openPrintModal = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsPrintModalOpen(true);
  };

  useEffect(() => {
    fetchPatient();
    fetchFiles();
    fetchPrintJobs();
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
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Print</th>
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
                      onClick={() => openPrintModal(file.id)}
                      type="button"
                      style={{ backgroundColor: '#4CAF50', color: 'white' }}
                    >
                      Print
                    </button>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      type="button"
                      style={{ backgroundColor: '#ff4444', color: 'white' }}
                    >
                      Supprimer
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

        <StartPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          fileId={selectedFileId}
          patientId={id || ''}
          onPrintStarted={handlePrintStarted}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Print Jobs</h2>
        {printJobsError && <p style={{ color: 'red' }}>{printJobsError}</p>}

        {printJobsLoading ? (
          <p>Loading print jobs...</p>
        ) : !printJobs || printJobs.length === 0 ? (
          <p>No print jobs found</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created At</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>End Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(printJobs) && printJobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{job.status}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {dayjs(job.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {job.endDate ? dayjs(job.endDate).format('DD/MM/YYYY HH:mm:ss') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
