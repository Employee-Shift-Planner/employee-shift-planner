// import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import NavigationBar from './components/navigation/NavigationBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import ShiftPlanner from './components/shift-planner/ShiftPlanner';
import Employee from './components/employee/Employee'
import HomePage from './components/HomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import { Spinner } from 'react-bootstrap';
import AdminPortal from './components/admin/AdminPortal';

function App() {
    const location = useLocation();
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        // Simulate app initialization (e.g., fetching config, auth, etc.)
        const timer = setTimeout(() => setInitializing(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (initializing) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.8)',
                zIndex: 9999
            }}>
                <Spinner animation="border" variant="primary" style={{ width: 80, height: 80 }} />
            </div>
        );
    }

    return (
        <>
            {!location.pathname.startsWith('/admin') && <NavigationBar/>}
            <Routes>
                <Route exact path="/" element={<HomePage/>}/>
                <Route exact path="/employee-shift-planner" element={<HomePage/>}/>
                <Route path='/shiftplanner' element={<ShiftPlanner/>}/>
                <Route path='/employee' element={<Employee/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/signup' element={<Signup/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path='/admin' element={<AdminPortal/>}/>
            </Routes>
        </>
    )
}

export default App;
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
