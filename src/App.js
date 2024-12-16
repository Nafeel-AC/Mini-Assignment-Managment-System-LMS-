import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { db, addDoc, collection, query, where, getDocs } from './components/firebase';
import TeacherDashboard from './components/TeacherDashboard';
import Student from './components/Student';
import ViewAssignments from './components/ViewAssignmentsPage';
import AssignmentDashboard from './components/AssignmentDashboard';

function App() {
  return (
    <Router>
      <div style={styles.container}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/student" element={<Student />} />
          <Route path="/view-assignments" element={<ViewAssignments />} />
          <Route path="/assignment-dashboard" element={<AssignmentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.welcomePage}>
      <h1 style={styles.heading}>Welcome to <span style={styles.highlight}>LMS</span></h1>
      <p style={styles.text}>Effortlessly manage your learning journey. Get started by logging in or registering below.</p>
      <div style={styles.buttonContainer}>
        <button style={{ ...styles.button, ...styles.buttonPrimary }} onClick={() => navigate('/login')}>Login</button>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const q = query(collection(db, 'users'), where('username', '==', username), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid credentials. Please try again.');
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      if (userDoc.role === 'teacher') navigate('/teacher-dashboard');
      else if (userDoc.role === 'student') navigate('/assignment-dashboard');
      else setError('Role not recognized.');
    } catch (e) {
      setError('Error logging in. Please try again later.');
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formPage}>
      <h2 style={styles.heading}>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <div style={styles.checkboxContainer}>
          <input type="checkbox" id="rememberMe" />
          <label htmlFor="rememberMe" style={styles.checkboxLabel}>Remember me</label>
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <p style={styles.forgotPassword}>Forgot Password?</p>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [schoolId, setSchoolId] = useState('');
  const [classSection, setClassSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (username.length < 3 || password.length < 6) {
        setError('Username must be at least 3 characters, and password at least 6.');
        return;
      }

      await addDoc(collection(db, 'users'), { username, password, role, schoolId, classSection });
      navigate('/login');
    } catch (e) {
      setError('Error registering. Please try again later.');
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <div style={styles.solidColorSection}></div>
      <div style={styles.formPage}>
        <h2 style={styles.heading}>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Email ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="School ID"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Class Section"
            value={classSection}
            onChange={(e) => setClassSection(e.target.value)}
            style={styles.input}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.input}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {error && <p style={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};



const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
    color: '#fff',
  },
  welcomePage: {
    textAlign: 'center',
    background: '#2C3E50',
    color: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  },
  formPage: {
    background: '#f9f9f9',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#030b33',
  },
  highlight: {
    color: '#3498db',
  },
  text: {
    fontSize: '1.2rem',
    marginBottom: '20px',
    color: '#ecf0f1',
  },
  buttonContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  button: {
    padding: '12px 25px',
    border: 'none',
    borderRadius: '30px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: '0.3s',
  },
  buttonPrimary: {
    background: '#3498db',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  buttonSecondary: {
    background: '#ecf0f1',
    color: '#3498db',
    border: '1px solid #3498db',
  },
  input: {
    padding: '10px',
    margin: '10px 0',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  },
  checkboxLabel: {
    marginLeft: '5px',
    color: '#030b33',
  },
  forgotPassword: {
    color: '#3498db',
    cursor: 'pointer',
    margin: '10px 0',
  },
  errorMessage: {
    color: 'red',
    fontSize: '0.9rem',
  },
  
};

export default App;