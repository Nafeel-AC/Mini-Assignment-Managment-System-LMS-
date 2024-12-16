import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate for navigation
import { db } from './firebase'; // Firebase configuration
import { collection, getDocs } from 'firebase/firestore'; // Firestore utilities

function AssignmentDashboard() {
  const [assignments, setAssignments] = useState([]); // State to store assignments
  const [loading, setLoading] = useState(true); // State for loading indicator
  const navigate = useNavigate(); // For navigation

  // Fetch assignments when component mounts
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'TeacherAssignments')); // Fetch assignments from TeacherAssignments collection
        const assignmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignments(assignmentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Handle redirection to Student.js for uploading assignment
  const handleUploadClick = (assignmentId) => {
    navigate('/student', { state: { assignmentId } }); // Use state to pass assignmentId to Student.js
  };

  // Handle navigation to ViewAssignmentsPage
  const handleViewAssignments = () => {
    navigate('/view-assignments'); // Redirect to ViewAssignmentsPage
  };

  if (loading) {
    return <p>Loading assignments...</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Assignments Dashboard</h2>
      <button onClick={handleViewAssignments} style={styles.viewButton}>
        View Assignments
      </button>
      {assignments.length === 0 ? (
        <p style={styles.noAssignmentsText}>No assignments available.</p>
      ) : (
        <div style={styles.assignmentCardsContainer}>
          {assignments.map((assignment) => (
            <div key={assignment.id} style={styles.assignmentCard}>
              <p style={styles.assignmentTitle}>
                <strong>Assignment Title:</strong> {assignment.title}
              </p>
              <p style={styles.assignmentId}>
                <strong>Assignment ID:</strong> {assignment.assignmentId}
              </p>
              <button
                onClick={() => handleUploadClick(assignment.id)} // Redirect to Student.js
                style={styles.uploadButton}
              >
                Upload Assignment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Basic styles for the Assignment Dashboard
const styles = {
  container: {
    padding: '40px',
    maxWidth: '1200px',
    minHeight: '600px',
    margin: '20px auto',
    borderRadius: '12px',
    backgroundColor: '#f4f6f9', // Light background for the container
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Poppins', sans-serif", // Use Poppins font for modern feel
    width: '90%',  // 90% width of the screen
    height: '90vh',  // 90% height of the viewport
  },
  heading: {
    textAlign: 'center',
    fontSize: '36px',
    marginBottom: '20px',
    color: '#34495e',
    fontWeight: '600',
  },
  viewButton: {
    padding: '12px 25px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px',
    borderRadius: '30px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: '1.1rem',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s, transform 0.3s',
  },
  viewButtonHover: {
    backgroundColor: '#2980b9',
    transform: 'scale(1.05)',
  },
  noAssignmentsText: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#e74c3c',
    fontWeight: '500',
  },
  assignmentCardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s, transform 0.3s',
  },
  assignmentCardHover: {
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    transform: 'scale(1.05)',
  },
  assignmentTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#34495e',
  },
  assignmentId: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '10px',
  },
  uploadButton: {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    borderRadius: '30px',
    fontSize: '1rem',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s, transform 0.3s',
  },
  uploadButtonHover: {
    backgroundColor: '#2980b9',
    transform: 'scale(1.05)',
  },
};

export default AssignmentDashboard;
