import React, { useState } from 'react';
import axios from 'axios';

const DepartmentForm = () => {
    const [name, setName] = useState('');
    const [parentDepartmentId, setParentDepartmentId] = useState('');
    const [createdAt, setCreatedAt] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/departments', { name, parentDepartmentId, createdAt });
            alert('Department created successfully');
        } catch (error) {
            alert('Failed to create department: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Create Department</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Department Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Parent Department ID:</label>
                    <input type="number" value={parentDepartmentId} onChange={(e) => setParentDepartmentId(e.target.value)} />
                </div>
                <div>
                    <label>Created Date:</label>
                    <input type="date" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} required />
                </div>
                <button type="submit">Create Department</button>
            </form>
        </div>
    );
};

export default DepartmentForm;