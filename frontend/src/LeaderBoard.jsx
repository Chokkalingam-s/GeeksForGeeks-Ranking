import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Table, Container } from 'react-bootstrap';
import './Leaderboard.css';

const departments = ["IT", "CSE", "ADS", "ME", "Civil", "CSBS", "CSD", "ECE", "EEE", "VLSI"];
const years = ["First Year", "Second Year", "Third Year", "Fourth Year"];

const Leaderboard = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newStudent, setNewStudent] = useState({
        reg_no: "", name: "", department: "", year: "", hackerrank_url: "",
    });

    const API_BASE = import.meta.env.VITE_BACKEND_API;


    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE}/students`);
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error fetching students:", errorText);
                return;
            }
            const data = await res.json();
            setStudents(data);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    useEffect(() => {
        fetchStudents(); // Initial Fetch
    
        // Auto-refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchStudents, 30000); 
    
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

     const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE}/add-student`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStudent),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error adding student:", errorText);
                return;
            }
            fetchStudents();
            setShowModal(false);
        } catch (error) {
            console.error("Submission Error:", error);
        }
    };

    const filteredStudents = students.filter((s) =>
        (search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.reg_no.includes(search)) &&
        (departmentFilter === "" || s.department === departmentFilter) &&
        (yearFilter === "" || s.year === yearFilter)
    );

    return (
        <Container fluid className="leaderboard-container">
            <h1 className="text-white text-center mb-4">R.M.K. Engineering College</h1>
            <h1 className="text-white text-center mb-4">Department of Information Technology</h1>
            <h1 className="text-white text-center mb-4">GeeksForGeeks Leaderboard</h1>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="warning" onClick={() => setShowModal(true)} className="add-btn">Add Student</Button>
                <Form.Control type="text" placeholder="Search by reg_no / Name" className="search-bar" onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="filters d-flex gap-2 mb-3">
                <Form.Select className="filter-dropdown" onChange={(e) => setDepartmentFilter(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </Form.Select>
                <Form.Select className="filter-dropdown" onChange={(e) => setYearFilter(e.target.value)}>
                    <option value="">All Years</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </Form.Select>
            </div>

            <Table bordered hover className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Register No</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Problem Solved</th>
                    </tr>
                </thead>
                <tbody>
    {filteredStudents.length > 0 ? (
        filteredStudents.map((s, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{s.reg_no || "N/A"}</td>
                <td>{s.name}</td>
                <td>{s.department}</td>
                <td>{s.year}</td>
                <td>{s.solved_count}</td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="6" className="text-center">No students found</td>
        </tr>
    )}
</tbody>

            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Add New Student</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Register No</Form.Label>
                            <Form.Control type="text" placeholder="Register No" onChange={(e) => setNewStudent({ ...newStudent, reg_no: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Name" onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Select onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}>
                                <option value="">Select Department</option>
                                {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Year</Form.Label>
                            <Form.Select onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}>
                                <option value="">Select Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>GeeksForGeeks Profile URL</Form.Label>
                            <Form.Control type="text" placeholder="GeeksForGeeks Profile URL" onChange={(e) => setNewStudent({ ...newStudent, hackerrank_url: e.target.value })} />
                        </Form.Group>
                        <Button type="submit" variant="success" className="w-100">Submit</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Leaderboard;