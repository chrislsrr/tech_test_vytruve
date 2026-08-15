import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreatePatientModal from '../components/CreatePatientModal';
import { patientService } from '../services/patientService';
import type { Patient } from '../services/patientService';

function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPatients(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientCreated = () => {
    fetchPatients();
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Patients</h1>
        <button onClick={() => setIsModalOpen(true)}>Create Patient</button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Last Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>First Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Age</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.lastName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.firstName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.age}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <Link to={`/patients/${patient.id}`} style={{ textDecoration: 'none' }}>
                    <button type="button">Consulter</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <CreatePatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />
    </div>
  );
}

export default Patients;

