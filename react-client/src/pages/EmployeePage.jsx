import React, { useState, useEffect } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';

const EmployeePage = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const handleOpenForm = () => setIsFormOpen(true);
        window.addEventListener('open-form', handleOpenForm);

        return () => {
            window.removeEventListener('open-form', handleOpenForm);
        };
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
            <EmployeeList />
            <EmployeeForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
        </div>
    );
};

export default EmployeePage;
