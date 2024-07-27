import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filters, setFilters] = useState({
        employeeId: '',
        departmentId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('/employees/employees', { params: filters });
                setEmployees(response.data);
            } catch (error) {
                console.error('Failed to fetch employees:', error);
            }
        };

        fetchEmployees();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleDismiss = async (id) => {
        try {
            await axios.delete(`/employees/${id}`);
            setEmployees(employees.filter(emp => emp.id !== id));
            alert('Employee dismissed successfully');
        } catch (error) {
            alert('Failed to dismiss employee: ' + error.message);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <button
                    className="py-2 px-4 bg-green-500 text-white rounded"
                    onClick={() => window.dispatchEvent(new Event('open-form'))}
                >
                    Hire Employee
                </button>
                <div className="flex space-x-4">
                    <input
                        type="number"
                        name="departmentId"
                        placeholder="Department ID"
                        value={filters.departmentId}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="button"
                        onClick={() => setFilters(filters)}
                        className="py-2 px-4 bg-blue-500 text-white rounded"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
            <h3 className="text-lg font-bold mb-2">Employees List</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="w-full bg-gray-100 border-b border-gray-300">
                            <th className="text-left p-4">ID</th>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Department ID</th>
                            <th className="text-left p-4">Hired At</th>
                            <th className="text-left p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} className="border-b border-gray-300">
                                <td className="p-4">{emp.id}</td>
                                <td className="p-4">{emp.name}</td>
                                <td className="p-4">{emp.departmentId}</td>
                                <td className="p-4">{emp.hiredAt}</td>
                                <td className="p-4">
                                    <button
                                        className="py-1 px-3 bg-red-500 text-white rounded"
                                        onClick={() => handleDismiss(emp.id)}
                                    >
                                        Dismiss
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeList;