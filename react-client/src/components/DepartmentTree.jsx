import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const getMaxOffset = (data, currentCenter = 0, min_coordinates = 0, max_coordinates = 0) => {
    if (data.childs && data.childs.length > 0) {
        for(let i = 0; i < data.childs.length; i++){
            const coordinates = getXcoordinates(data.childs.length, currentCenter, 180);
            let { child_max, child_min } = getMaxOffset(data.childs[i], coordinates[i], min_coordinates, max_coordinates);
            
            if (min_coordinates > child_min) {
                min_coordinates = child_min;
            }
    
            if (max_coordinates < child_max) {
                max_coordinates = child_max;
            }
        }
    }

    return { max_coordinates, min_coordinates };
}

const buildHierarchy = (data, nodes = [], edges = [], parentId = null, level = 0, xCenter = 0) => {
    const xBaseOffset = 180;
    const yBaseOffset = 100;

    const spacing = 180;

    const coordinates = getXcoordinates(data.length, xCenter, spacing);

    data.forEach((item, index) => {
        const nodeId = item.id.toString();
        const nodeX = coordinates[index];
        const nodeY = level * yBaseOffset;

        xCenter = coordinates[index];

        if(index === 1){
            console.log(getMaxOffset(item))
        }

        nodes.push({
            id: nodeId,
            data: { label: item.name },
            position: { x: nodeX, y: nodeY },
        });

        if (parentId) {
            edges.push({
                id: `e${parentId}-${nodeId}`,
                source: parentId.toString(),
                target: nodeId,
            });
        }

        if (item.childs && item.childs.length > 0) {
            buildHierarchy(item.childs, nodes, edges, nodeId, level + 1, xCenter);
        }
    });

    return { nodes, edges };
};

// Пример функции getXcoordinates
function getXcoordinates(count, centerX, spacing) {
    let coordinates = [];
    let offset = (count - 1) / 2 * spacing;

    for (let i = 0; i < count; i++) {
        let x = centerX - offset + i * spacing;
        coordinates.push(x);
    }

    return coordinates;
}

const AddNodeOnEdgeDrop = () => {
  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodePosition, setNewNodePosition] = useState({ x: 0, y: 0 });
  const [newNodeId, setNewNodeId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8081/departments').then((response) => {
      const { nodes, edges } = buildHierarchy(response.data);
      setNodes(nodes);
      setEdges(edges);
    });
  }, []);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const onConnect = useCallback((params) => {
    connectingNodeId.current = null;
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        const id = -1;
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        setNewNodeId(id);
        setNewNodePosition(position);
        openModal();
      }
    },
    [screenToFlowPosition]
  );

  const handleAddNode = () => {
    const parentId = connectingNodeId.current;
    const newNode = {
      name: newNodeName || `Node ${newNodeId}`,
      parentId: parentId ? parseInt(parentId) : null,
    };

    axios
      .post('http://localhost:8081/departments', newNode)
      .then((response) => {
        const createdNode = response.data;
        const createdNodeId = createdNode.id.toString();

        const newNode = {
          id: createdNodeId,
          position: newNodePosition,
          data: { label: createdNode.name },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            id: `e${parentId}-${createdNodeId}`,
            source: parentId,
            target: createdNodeId,
          })
        );
      })
      .catch((error) => {
        console.error('Error creating node:', error);
      });

    setNewNodeName('');
    closeModal();
  };

  return (
    <div className="wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 2 }}
        nodeOrigin={[0.5, 0]}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="overlay fixed inset-0 bg-black bg-opacity-50"
        contentLabel="New Node Name"
      >
        <h2 className="text-xl font-bold mb-4">Enter Node Name</h2>
        <input
          type="text"
          value={newNodeName}
          onChange={(e) => setNewNodeName(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddNode}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Add Node
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 ml-2"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
