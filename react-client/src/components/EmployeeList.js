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

    return (
        <div>
            <h2>View Employees</h2>
            <form>
                <div>
                    <label>Employee ID:</label>
                    <input type="number" name="employeeId" value={filters.employeeId} onChange={handleFilterChange} />
                </div>
                <div>
                    <label>Department ID:</label>
                    <input type="number" name="departmentId" value={filters.departmentId} onChange={handleFilterChange} />
                </div>
                <div>
                    <label>Start Date:</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </div>
                <div>
                    <label>End Date:</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </div>
                <button type="button" onClick={() => setFilters(filters)}>Apply Filters</button>
            </form>
            <h3>Employees List</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department ID</th>
                        <th>Hired At</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.id}</td>
                            <td>{emp.name}</td>
                            <td>{emp.departmentId}</td>
                            <td>{emp.hiredAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeList;