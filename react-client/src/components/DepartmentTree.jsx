import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    addEdge, MiniMap, Controls, Background, useNodesState, useEdgesState, useReactFlow, ReactFlow, ReactFlowProvider
} from '@xyflow/react';
import axios from 'axios';
import '@xyflow/react/dist/style.css';

const initialNodes = [];
const initialEdges = [];

// Function to generate unique IDs
let id = 1;
const getId = () => `${id++}`;

const DepartmentTree = () => {
    const reactFlowWrapper = useRef(null);
    const connectingNodeId = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [newNodePosition, setNewNodePosition] = useState({ x: 0, y: 0 });
    const [nodeIdMap, setNodeIdMap] = useState(new Map());

    const { screenToFlowPosition } = useReactFlow();

    // Fetch initial department data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8081/departments');
                const data = response.data;
    
                console.log('Fetched data:', data); // Проверьте структуру данных
    
                // Helper function to recursively process departments
                const processDepartments = (departments, parentId = null) => {
                    return departments.flatMap(dept => {
                        const id = dept.id;
                        // Create the node and store the server ID
                        const node = {
                            id,
                            position: { x: Math.random() * 500, y: Math.random() * 500 },
                            data: { label: `Node ${id}` },
                            origin: [0.5, 0.0],
                        };
    
                        // Recursively process child departments
                        const childData = Array.isArray(dept.childs) ? processDepartments(dept.childs, id) : { nodes: [], edges: [] };
    
                        // Create edges for the current node
                        const edges = [...childData.edges];
    
                        // Create edge from parent to current node
                        if (parentId) {
                            edges.push({ id: `e${parentId}-${id}`, source: parentId, target: id });
                        }
    
                        return [{ node, edges }];
                    }).reduce((acc, { node, edges }) => {
                        acc.nodes.push(node);
                        acc.edges.push(...edges);
                        return acc;
                    }, { nodes: [], edges: [] });
                };
    
                // Build the hierarchy
                const { nodes: fetchedNodes, edges: fetchedEdges } = processDepartments(data);
    
                // Update state with the fetched nodes and edges
                setNodes(fetchedNodes);
                setEdges(fetchedEdges);
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            }
        };
        fetchData();
    }, [setEdges, setNodes]);

    const onConnect = useCallback((params) => {
        connectingNodeId.current = null;
        setEdges((eds) => addEdge(params, eds));
    }, [setEdges]);

    const onConnectStart = useCallback((_, { nodeId }) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd = useCallback(
        (event) => {
            if (!connectingNodeId.current) return;
    
            const targetIsPane = event.target.classList.contains('react-flow__pane');
    
            if (targetIsPane) {
                const { x, y } = screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });
    
                const id = getId();
                const newNode = {
                    id,
                    position: { x, y },
                    data: { label: `Node ${id}` },
                };
    
                setNodes((nds) => nds.concat(newNode));
                setEdges((eds) =>
                    eds.concat({ id: `e${connectingNodeId.current}-${id}`, source: connectingNodeId.current, target: id }),
                );
                setIsFormOpen(true);
            }
        },
        [screenToFlowPosition, setEdges, setNodes]
    );
    

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const parentId = selectedNode ? nodeIdMap.get(selectedNode.id) : null;
        try {
            const response = await axios.post('http://localhost:8081/departments', { name: newDepartmentName, parentId });
            const newNode = {
                id: getId(),
                data: { label: newDepartmentName },
                position: newNodePosition,
            };
            setNodes((nds) => nds.concat(newNode));
            if (selectedNode) {
                const newEdge = { id: `e${selectedNode.id}-${newNode.id}`, source: selectedNode.id, target: newNode.id };
                setEdges((eds) => eds.concat(newEdge));
            }
            setIsFormOpen(false);
            setNewDepartmentName('');
        } catch (error) {
            alert('Failed to create department: ' + error.message);
        }
    };

    return (
        <div className="wrapper" ref={reactFlowWrapper}>
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Department Structure</h2>
                <button onClick={() => { setSelectedNode(null); setNewNodePosition({ x: Math.random() * 500, y: Math.random() * 500 }); setIsFormOpen(true); }} className="py-2 px-4 bg-blue-500 text-white rounded">Add Root Node</button>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onConnectStart={onConnectStart}
                onConnectEnd={onConnectEnd}
                onNodeDoubleClick={(event, node) => { setSelectedNode(node); setNewNodePosition({ x: node.position.x + 100, y: node.position.y + 100 }); setIsFormOpen(true); }}
                fitView
                fitViewOptions={{ padding: 2 }}
            >
                <MiniMap />
                <Controls />
                <Background />
            </ReactFlow>
            {isFormOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded shadow-md">
                        <h3 className="text-lg font-bold mb-2">Create Department</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2">Department Name:</label>
                                <input
                                    type="text"
                                    value={newDepartmentName}
                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded">Create</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <DepartmentTree />
    </ReactFlowProvider>
);
