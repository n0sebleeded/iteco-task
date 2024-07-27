import React from 'react';
import DepartmentTree from '../components/DepartmentTree';

const DepartmentPage = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Department Management</h1>
            <DepartmentTree />
        </div>
    );
};

export default DepartmentPage;