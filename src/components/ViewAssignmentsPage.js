import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import Firebase configuration
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore utilities

function ViewAssignments() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle username and password changes
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Handle authentication
  const handleAuthentication = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setMessage('Authenticating...');

    try {
      // Query Firestore to validate username and password
      const usersRef = collection(db, 'users'); // Assuming 'users' collection contains student credentials
      const q = query(usersRef, where('username', '==', username), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      setMessage('Authenticated successfully!');
      setError('');
      setLoading(false);
    } catch (err) {
      setError('Error during authentication: ' + err.message);
      setLoading(false);
    }
  };

  // Fetch assignments for the authenticated user
  const fetchAssignments = async () => {
    setLoading(true);
    setMessage('Fetching assignments...');
    setAssignments([]); // Clear previous assignments

    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('studentName', '==', username)); // Use the authenticated username as studentName

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No assignments found for this user.');
        setLoading(false);
        return;
      }

      const assignmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAssignments(assignmentsData);
      setMessage('Assignments fetched successfully.');
      setLoading(false);
    } catch (err) {
      setError('Error fetching assignments: ' + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchAssignments();
    }
  }, [authenticated]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}><strong>View Assignments</strong></h2>

      {/* Authentication Form */}
      {!authenticated && (
        <form onSubmit={handleAuthentication} style={styles.form}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      )}

      {/* Display messages */}
      {loading && <p style={styles.loadingMessage}>{message}</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}

      {/* Display assignments */}
      {authenticated && assignments.length > 0 && (
        <div style={styles.assignmentsContainer}>
          {assignments.map((assignment) => (
            <div key={assignment.id} style={styles.assignmentBubble}>
              <p style={{ color: 'black' }}>
                <strong>Assignment Title:</strong> {assignment.assignmentTitle}
              </p>
              <p style={{ color: 'black' }}>
                <strong>Marks:</strong>{' '}
                {assignment.marks !== undefined ? assignment.marks : 'Not graded yet'}
              </p>
              <div>
                <h4 style={{ color: 'black' }}>Comments:</h4>
                {assignment.comments && assignment.comments.length > 0 ? (
                  <ul style={styles.commentList}>
                    {assignment.comments.map((comment, index) => (
                      <li key={index}>
                        <p style={{ color: 'black' }}>
                          <strong>Comment:</strong> {comment.commentText}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'black' }}>No comments yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {authenticated && assignments.length === 0 && !loading && (
        <p style={styles.message}>No assignments available.</p>
      )}
    </div>
  );
}

// Basic styles for the page
const styles = {
  container: {
    padding: '30px',
    minHeight: '100vh', // Make sure the container fills the entire viewport
    backgroundColor: '#f2f2f2', // Light background color for the entire page
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '30px',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    padding: '14px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    marginBottom: '12px',
  },
  button: {
    padding: '14px 24px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#2980b9',
  },
  loadingMessage: {
    fontSize: '16px',
    color: '#007BFF',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: '16px',
    color: 'red',
    textAlign: 'center',
  },
  assignmentsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
    width: '100%',
    maxWidth: '800px',
  },
  assignmentBubble: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ddd',
  },
  commentList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  message: {
    fontSize: '18px',
    textAlign: 'center',
    color: '#7f8c8d',
  },
};

export default ViewAssignments;
