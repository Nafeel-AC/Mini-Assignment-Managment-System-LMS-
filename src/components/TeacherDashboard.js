import React, { useEffect, useState } from 'react';
import { db } from './firebase'; // Import Firebase configuration
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore'; // Firestore utilities

function TeacherDashboard() {
  const [submissions, setSubmissions] = useState([]); // Store all student submissions
  const [filteredAssignments, setFilteredAssignments] = useState([]); // Store filtered assignments by ID
  const [filterID, setFilterID] = useState(''); // Filter state for assignment ID
  const [newAssignmentID, setNewAssignmentID] = useState(''); // New assignment ID state
  const [newAssignmentTitle, setNewAssignmentTitle] = useState(''); // New assignment title state
  const [existingAssignmentIDs, setExistingAssignmentIDs] = useState([]); // Store existing IDs to check for conflicts
  const [selectedMarks, setSelectedMarks] = useState({}); // Marks for each submission
  const [newComment, setNewComment] = useState({}); // Comments for each submission

  // Fetch assignments and student submissions from Firestore
  useEffect(() => {
    const fetchAssignmentsAndSubmissions = async () => {
      try {
        // Fetch teacher-created assignments from TeacherAssignments collection
        const assignmentsSnapshot = await getDocs(collection(db, 'TeacherAssignments'));
        const assignmentsData = assignmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExistingAssignmentIDs(assignmentsData.map(assignment => assignment.assignmentId)); // Store IDs for new assignment creation

        // Fetch student submissions from assignments collection (filtered by assignment ID)
        const submissionsSnapshot = await getDocs(collection(db, 'assignments'));
        const submissionsData = submissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubmissions(submissionsData);
        setFilteredAssignments(submissionsData);
      } catch (error) {
        console.error('Error fetching assignments and submissions from Firestore:', error);
      }
    };

    fetchAssignmentsAndSubmissions();
  }, []);

  // Handle filter input change for assignment ID
  const handleFilterChange = (e) => {
    setFilterID(e.target.value);
    const filtered = submissions.filter((submission) => {
      const assignmentId = submission.assignmentId || ''; // Ensure assignmentId is a string or fallback to an empty string
      return assignmentId.toLowerCase().includes(e.target.value.toLowerCase());
    });
    setFilteredAssignments(filtered);
  };
  

  // Handle new assignment ID input change
  const handleNewAssignmentIDChange = (e) => {
    setNewAssignmentID(e.target.value);
  };

  // Handle new assignment title input change
  const handleNewAssignmentTitleChange = (e) => {
    setNewAssignmentTitle(e.target.value);
  };

  // Check if new assignment ID conflicts with existing IDs
  const handleCreateAssignmentID = async () => {
    if (existingAssignmentIDs.includes(newAssignmentID)) {
      alert('This assignment ID already exists. Please choose a different one.');
      return;
    }

    try {
      // Create new assignment in TeacherAssignments collection
      const newAssignmentRef = doc(db, 'TeacherAssignments', newAssignmentID);
      await setDoc(newAssignmentRef, {
        assignmentId: newAssignmentID,
        title: newAssignmentTitle,
      });

      setExistingAssignmentIDs(prev => [...prev, newAssignmentID]); // Update existing IDs list
      alert('Assignment ID and title created successfully!');
    } catch (error) {
      console.error('Error creating assignment ID:', error);
    }
  };

  // Download the file from Cloudinary using the file URL
  const downloadFile = (fileUrl) => {
    try {
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file.');
    }
  };

  // Handle marks input change
  const handleMarksChange = (submissionId, marks) => {
    if (marks < 0 || marks > 10) {
      alert('Please enter marks between 0 and 10.');
      return;
    }
    setSelectedMarks((prevMarks) => ({
      ...prevMarks,
      [submissionId]: marks,
    }));
  };

  // Update marks in Firestore
  const updateMarks = async (submissionId) => {
    if (!selectedMarks[submissionId]) {
      alert('Please enter marks before updating.');
      return;
    }

    try {
      const submissionRef = doc(db, 'assignments', submissionId); // Update in assignments collection
      await updateDoc(submissionRef, { marks: selectedMarks[submissionId] });

      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === submissionId
            ? { ...submission, marks: selectedMarks[submissionId] }
            : submission
        )
      );
      alert('Marks updated successfully!');
    } catch (error) {
      console.error('Error updating marks:', error);
      alert('Failed to update marks.');
    }
  };

  // Handle adding comments
  const handleAddComment = async (submissionId, commentText) => {
    if (!commentText) {
      alert('Please enter a comment before adding.');
      return;
    }

    try {
      const submissionRef = doc(db, 'assignments', submissionId);
      const newCommentObj = { commentText };

      await updateDoc(submissionRef, {
        comments: [...(submissions.find((submission) => submission.id === submissionId)?.comments || []), newCommentObj],
      });

      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((submission) =>
          submission.id === submissionId
            ? { ...submission, comments: [...(submission.comments || []), newCommentObj] }
            : submission
        )
      );
      setNewComment((prev) => ({ ...prev, [submissionId]: '' }));
      alert('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Teacher Dashboard</h1>
        <div style={styles.headerAccent}></div>
      </div>

      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Create New Assignment</h3>
          <div style={styles.cardContent}>
            <input
              type="text"
              placeholder="Enter Assignment ID"
              value={newAssignmentID}
              onChange={handleNewAssignmentIDChange}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Enter Assignment Title"
              value={newAssignmentTitle}
              onChange={handleNewAssignmentTitleChange}
              style={styles.input}
            />
            <button onClick={handleCreateAssignmentID} style={styles.primaryButton}>
              Create Assignment
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Filter Submissions</h3>
          <div style={styles.cardContent}>
            <input
              type="text"
              placeholder="Filter by Assignment ID"
              value={filterID}
              onChange={handleFilterChange}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📝</div>
          <p style={styles.emptyStateText}>No submissions available</p>
        </div>
      ) : (
        <div style={styles.submissionGrid}>
          {filteredAssignments.map((submission) => (
            <div key={submission.id} style={styles.submissionCard}>
              <div style={styles.submissionHeader}>
                <h3 style={styles.studentName}>{submission.studentName}</h3>
                <span style={styles.badge}>{submission.assignmentId || 'No ID'}</span>
              </div>
              
              <div style={styles.submissionDetails}>
                <p style={styles.assignmentTitle}>{submission.assignmentTitle || 'No title assigned'}</p>
                
                <div style={styles.actionGroup}>
                  <button 
                    onClick={() => downloadFile(submission.fileUrl)} 
                    style={styles.iconButton}
                  >
                    📥 Download
                  </button>
                  
                  <div style={styles.marksContainer}>
                    <input
                      type="number"
                      placeholder="Marks (0-10)"
                      min="0"
                      max="10"
                      style={styles.marksInput}
                      value={selectedMarks[submission.id] || ''}
                      onChange={(e) => handleMarksChange(submission.id, parseInt(e.target.value, 10))}
                    />
                    <button 
                      onClick={() => updateMarks(submission.id)} 
                      style={styles.updateButton}
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div style={styles.commentsSection}>
                  <h4 style={styles.commentsTitle}>Comments</h4>
                  <div style={styles.commentsList}>
                    {submission.comments && submission.comments.length > 0 ? (
                      submission.comments.map((comment, index) => (
                        <div key={index} style={styles.commentBubble}>
                          {comment.commentText}
                        </div>
                      ))
                    ) : (
                      <p style={styles.noComments}>No comments yet</p>
                    )}
                  </div>
                  
                  <div style={styles.addCommentContainer}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[submission.id] || ''}
                      onChange={(e) =>
                        setNewComment((prev) => ({ ...prev, [submission.id]: e.target.value }))
                      }
                      style={styles.commentInput}
                    />
                    <button
                      onClick={() => handleAddComment(submission.id, newComment[submission.id])}
                      style={styles.addCommentButton}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const styles = {
  container: {
    padding: '2rem',
    width: '90%', // Changed from maxWidth to width: 90%
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)', // Added shadow for better depth
    borderRadius: '15px', // Optional: added rounded corners
  },
  header: {
    marginBottom: '3rem',
    position: 'relative',
  },
  mainTitle: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '1rem',
    fontWeight: '700',
  },
  headerAccent: {
    width: '80px',
    height: '4px',
    backgroundColor: '#3498db',
    margin: '0 auto',
    borderRadius: '2px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    color: '#2c3e50',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    '&:focus': {
      borderColor: '#3498db',
      outline: 'none',
    },
  },
  primaryButton: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  submissionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
  },
  submissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  submissionHeader: {
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    margin: 0,
    fontSize: '1.25rem',
    color: '#2c3e50',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#e9ecef',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    color: '#495057',
  },
  submissionDetails: {
    padding: '1.5rem',
  },
  assignmentTitle: {
    fontSize: '1rem',
    color: '#6c757d',
    marginBottom: '1rem',
  },
  actionGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  iconButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e9ecef',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#dee2e6',
    },
  },
  marksContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  marksInput: {
    width: '80px',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
  },
  updateButton: {
    backgroundColor: '#2ecc71',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#27ae60',
    },
  },
  commentsSection: {
    marginTop: '1.5rem',
  },
  commentsTitle: {
    fontSize: '1rem',
    color: '#2c3e50',
    marginBottom: '1rem',
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  commentBubble: {
    backgroundColor: '#f8f9fa',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#495057',
  },
  noComments: {
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  addCommentContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  commentInput: {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid #e9ecef',
  },
  addCommentButton: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
  },
  emptyStateIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyStateText: {
    color: '#6c757d',
    fontSize: '1.25rem',
  },
};

export default TeacherDashboard;
