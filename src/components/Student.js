import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

function StudentPage() {
  const [file, setFile] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !studentName || !assignmentTitle) {
      alert('Please fill all fields and upload a file');
      return;
    }

    setLoading(true);
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'files123');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dducocetl/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setProgress(percent);
          },
        }
      );

      const fileUrl = response.data.secure_url;
      setUploadedFileUrl(fileUrl);
      setMessage('File uploaded successfully');

      const assignmentRef = collection(db, 'assignments');
      await addDoc(assignmentRef, {
        studentName,
        assignmentTitle,
        fileUrl,
        submissionDate: new Date(),
      });

      setMessage('Assignment submitted successfully');
      setLoading(false);
    } catch (error) {
      setMessage('Error uploading file. Please try again.');
      setLoading(false);
    }
  };

  const handleViewAssignments = () => {
    navigate('/view-assignments');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Student Assignment Upload</h2>
      <div style={styles.form}>
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Assignment Title"
          value={assignmentTitle}
          onChange={(e) => setAssignmentTitle(e.target.value)}
          style={styles.input}
        />
        <label style={styles.fileLabel}>
          <input
            type="file"
            accept=".doc,.docx,.pdf"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          {file ? file.name : 'Choose File'}
        </label>
        <button onClick={handleSubmit} style={loading ? styles.buttonDisabled : styles.button}>
          {loading ? 'Uploading...' : 'Submit Assignment'}
        </button>
        <button onClick={handleViewAssignments} style={styles.secondaryButton}>
          View Assignments
        </button>
      </div>

      {loading && (
        <div style={styles.progressContainer}>
          <p style={styles.progressText}>Uploading: {progress}%</p>
          <progress value={progress} max="100" style={styles.progress}></progress>
        </div>
      )}

      {uploadedFileUrl && (
        <div style={styles.fileUrlContainer}>
          <p style={styles.successMessage}>
            File uploaded successfully:&nbsp;
            <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
              View file
            </a>
          </p>
        </div>
      )}

      <p style={loading ? styles.loadingMessage : styles.successMessage}>{message}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '650px',
    margin: '30px auto',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    fontSize: '26px',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#f7f7f7',
  },
  fileLabel: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#f7f7f7',
    color: 'black',
    cursor: 'pointer',
    textAlign: 'center',
  },
  fileInput: {
    display: 'none', // Hide the default file input
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  buttonDisabled: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  progressContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  progress: {
    width: '100%',
    height: '10px',
    borderRadius: '5px',
    margin: '10px 0',
  },
  progressText: {
    fontSize: '16px',
    color: '#555',
  },
  loadingMessage: {
    textAlign: 'center',
    color: '#007bff',
    fontSize: '16px',
  },
  successMessage: {
    textAlign: 'center',
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  fileUrlContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
  },
};

export default StudentPage;