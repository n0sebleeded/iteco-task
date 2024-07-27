import React, { useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

const EmployeeForm = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [hiredAt, setHiredAt] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/employees', { name, departmentId, hiredAt });
            alert('Employee hired successfully');
            onClose();
        } catch (error) {
            alert('Failed to hire employee: ' + error.message);
        }
    };

    return (
        <Transition show={isOpen}>
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Hire Employee</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-2">Employee Name:</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Department ID:</label>
                            <input
                                type="number"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Hired Date:</label>
                            <input
                                type="date"
                                value={hiredAt}
                                onChange={(e) => setHiredAt(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-4 py-2 px-4 bg-gray-500 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="py-2 px-4 bg-blue-500 text-white rounded"
                            >
                                Hire Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    );
};

export default EmployeeForm;
