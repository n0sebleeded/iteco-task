import React, { useState } from 'react';
import DepartmentPage from './pages/DepartmentPage';
import EmployeePage from './pages/EmployeePage';

const App = () => {
    const [currentPage, setCurrentPage] = useState('departments');

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <header style={{ padding: '20px', textAlign: 'center' }}>
                <button
                    onClick={() => handlePageChange('departments')}
                    style={{
                        margin: '0 10px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        backgroundColor: currentPage === 'departments' ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Manage Departments
                </button>
                <button
                    onClick={() => handlePageChange('employees')}
                    style={{
                        margin: '0 10px',
                        padding: '10px 20px',
                        cursor: 'pointer',
                        backgroundColor: currentPage === 'employees' ? '#007bff' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Manage Employees
                </button>
            </header>
            <main style={{ padding: '20px' }}>
                {currentPage === 'departments' && <DepartmentPage />}
                {currentPage === 'employees' && <EmployeePage />}
            </main>
        </div>
    );
};

export default App;