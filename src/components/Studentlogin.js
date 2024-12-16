import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function StudentLogin() {
  const [studentName, setStudentName] = useState('');
  const [studentID, setStudentID] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Track login status
  const navigate = useNavigate();  // Hook for navigation

  // List of 10 students with their names and IDs
  const students = [
    { name: 'John Doe', id: '12345' },
    { name: 'Jane Smith', id: '12346' },
    { name: 'Alice Johnson', id: '12347' },
    { name: 'Bob Brown', id: '12348' },
    { name: 'Charlie Davis', id: '12349' },
    { name: 'David Evans', id: '12350' },
    { name: 'Eve Harris', id: '12351' },
    { name: 'Frank Lee', id: '12352' },
    { name: 'Grace Walker', id: '12353' },
    { name: 'Henry Scott', id: '12354' }
  ];

  const handleLogin = () => {
    // Trim the input fields to avoid errors due to extra spaces
    const trimmedName = studentName.trim();
    const trimmedID = studentID.trim();

    // Check if the entered credentials match any student in the list
    const student = students.find(
      (student) => student.name === trimmedName && student.id === trimmedID
    );

    if (student) {
      setIsLoggedIn(true);  // Set login status to true
      navigate('/student');  // Redirect to Student Page after login
    } else {
      setError('Invalid student credentials');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginForm}>
        <h2 style={styles.heading}>Student Login</h2>
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Student ID"
          value={studentID}
          onChange={(e) => setStudentID(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>Login</button>
        
        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"Poppins", sans-serif', // Rounded font
    backgroundColor: '#f2e0d6',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  loginForm: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    color: '#2C3E50',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#ffffff',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  errorText: {
    color: 'red',
    fontSize: '0.9rem',
    marginTop: '10px',
  },
};

export default StudentLogin;
