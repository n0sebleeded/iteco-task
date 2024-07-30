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

function getXcoordinates(count, centerX, spacing) {
    let coordinates = [];
    let offset = (count - 1) / 2 * spacing;

    for (let i = 0; i < count; i++) {
        let x = centerX - offset + i * spacing;
        coordinates.push(x);
    }
    return coordinates;
}

const getGlOffset = (nodes, spacing = 180) => {
  //Короче идея в следующем, вместо того, чтобы ебаться с обходом дерева работает с nodes, который получили из 
  //buildHierarchy. Я заметил интересную вещь, nodes идут по следующему порядку:
  //[graph1 --> graph1_child --> graph1_child_child --> graph2...] (1)
  //Мы можем получить координаты(node.position.x) и разделить каждый граф отдельно друг от друга.
  //Затем вычислить r_prev_offset(правая половина предыдущего графа) и l_curr_offset(левая половина текущего графа) 
  //И затем каждому ГРАФУ прибавлять расстояние
  //Спрашивается как же разделить графы, если по сути nodes это просто массив объектов каждого нода.
  //Тут я заметил следующий нюанс, из (1) следует, что после всех потомков graph1 следует graph2, а
  //Каждый граф начинается с node.position.y = 0 !!
    const positions = [];
    let diff = []

    let local_min = 0;
    let local_max = 0;

    nodes.forEach((node) => {
        positions.push(node.position);
    })
    //console.log(positions);

    //Здесь я разделяю ноды на графы, каждый граф имеет минимум, максимум и центр.
    //Так же здесь наблюдается проблема с графами следующего вида:
    //      0
    //      |
    //      0
    //      |
    //      0
    //Запусти логи с сам поймешь(min: 0 center: X max:X)
    //Цикл забирает графы в обратном порядке, это связано с условием
    //positions[i].y === 0. 0-вой элемент всего был с y = 0 и было
    //Очень неудобно как то min и max этого графа, потому что выходило 
    //Так, что сначала идет y = 0, а потом все его ноды.
    for (let i = positions.length - 1; i >= 0; i--) {
        if (positions[i].x > local_max) local_max = positions[i].x;
        if (positions[i].x < local_min) local_min = positions[i].x;
        if (positions[i].y === 0) {
            diff.push({min: local_min, center: positions[i].x , max: local_max});
            local_min = 0;
            local_max = 0;
        }
    }
    //Соответственно привожу графы в первоначальный порядок
    diff = diff.reverse();

    let index = -1;
    let r_prev_offset;
    let l_curr_offset;
    nodes.forEach((node) => {
        if (node.position.y === 0) {
            index++;
        }
        if (index > 0) {
  //Тут выясняются 2 очень важных нюанса
  //1. В частности для второго графа отступ действительно
  //Должен считаться как правая_часть_пред_графа + отступ + левая_часть_кур_графа (2)
  //Но в общем случае мы должны отступать не от правой части пред графа, а от самого
  //Первого графа
  //2. В (2) мы отбрасываем отступ, потому что он сам выставляется в строке 21.
            let r_prev_offset_local = 0;
            for (let i = index; i >= 1; i--) {
                if (!(diff[i - 1].max === diff[i - 1].center || diff[i - 1].min === diff[i - 1].center)) {
                    r_prev_offset_local += diff[i - 1].max - diff[i - 1].min;
                }
            }
            r_prev_offset = r_prev_offset_local
            /*if (diff[index - 1].max === diff[index - 1].center || diff[index - 1].min === diff[index - 1].center) {
                let r_prev_offset_local = 0;
                for (let i = index - 1; i >= 1; i--) {
                    if (diff[i - 1].max === diff[i - 1].center || diff[i - 1].min === diff[i - 1].center) {
                        r_prev_offset_local += 0;
                    } else {
                        r_prev_offset_local += diff[i - 1].max - diff[i - 1].min;
                    }
                }
                r_prev_offset = r_prev_offset_local;*/
            /*} else {
                r_prev_offset = diff[index - 1].max - diff[index - 1].min;
            }*/
//Это попытка минимизировать баг,
//Упомянутый в строках 48-55
            if (diff[index].max === diff[index].center || diff[index].min=== diff[index].center) {
                l_curr_offset = 0;
            } else {
                l_curr_offset = diff[index].center - diff[index].min;
            }
            //l_curr_offset = diff[index].center - diff[index].min;
            node.position = {x: r_prev_offset + l_curr_offset + node.position.x, y: node.position.y}
        }
        console.log(r_prev_offset, l_curr_offset, index);
    })
    console.log(diff);
//Возвращать ничего не надо, потому что
//nodes имеет ссылочный тип
}

const buildHierarchy = (data, nodes = [], edges = [], parentId = null, level = 0, xCenter = 0) => {
    const yBaseOffset = 100;

    const spacing = 180;

    let coordinates = getXcoordinates(data.length, xCenter, spacing);

    data.forEach((item, index) => {
        const nodeId = item.id.toString();
        const nodeX = coordinates[index];
        const nodeY = level * yBaseOffset;

        xCenter = coordinates[index];

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
        const data = [
          //tests w/o back
            {
                id: 2,
                name: "root12",
                childs: [
                    {
                        id: 3,
                        name: "root123",
                        childs: [
                            {
                                id: 8,
                                name: "nameDepartment",
                                childs: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 4,
                name: "new",
                childs: [
                    {
                        id: 9,
                        name: "вфывф",
                        childs: []
                    },
                    {
                        id: 10,
                        name: "пыва",
                        childs: [
                            {
                                id: 13,
                                name: "nodelvl3_1",
                                childs: []
                            },
                            {
                                id: 14,
                                name: "nodelvl3_2",
                                childs: []
                            },
                            {
                                id: 15,
                                name: "asdsadaf",
                                childs: []
                            },
                            {
                                id: 16,
                                name: "gasdada",
                                childs: [
                                    {
                                        id: 21,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 22,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 23,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 24,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 25,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 26,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 27,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 28,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 29,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 30,
                                        name: "afaSDASDASD",
                                        childs: []
                                    }
                                ]
                            },
                            {
                                id: 17,
                                name: "agasdad",
                                childs: []
                            },
                            {
                                id: 18,
                                name: "agasdadasda",
                                childs: []
                            },
                            {
                                id: 19,
                                name: "afaSDASDASD",
                                childs: []
                            }
                        ]
                    },
                    {
                        id: 11,
                        name: "new Node",
                        childs: []
                    },
                    {
                        id: 12,
                        name: "another",
                        childs: []
                    }
                ]
            },
            {
                id: 5,
                name: "dsadasd",
                childs: [
                    {
                        id: 6,
                        name: "asdsad",
                        childs: [
                            {
                                id: 7,
                                name: "mem",
                                childs: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 31,
                name: "dsadasd",
                childs: [
                    {
                        id: 32,
                        name: "asdsad",
                        childs: [
                            {
                                id: 50,
                                name: "afaSDASDASD",
                                childs: []
                            },
                            {
                                id: 51,
                                name: "afaSDASDASD",
                                childs: []
                            },
                            {
                                id: 52,
                                name: "afaSDASDASD",
                                childs: []
                            },
                            {
                                id: 53,
                                name: "mem",
                                childs: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 34,
                name: "dsadasd",
                childs: [
                    {
                        id: 35,
                        name: "asdsad",
                        childs: [
                            {
                                id: 36,
                                name: "mem",
                                childs: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 37,
                name: "dsadasd",
                childs: [
                    {
                        id: 38,
                        name: "asdsad",
                        childs: [
                            {
                                id: 39,
                                name: "mem",
                                childs: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 40,
                name: "dsadasd",
                childs: [
                    {
                        id: 41,
                        name: "asdsad",
                        childs: [
                            {
                                id: 42,
                                name: "mem",
                                childs: [
                                    {
                                        id: 43,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 44,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                    {
                                        id: 45,
                                        name: "afaSDASDASD",
                                        childs: []
                                    },
                                ]
                            }
                        ]
                    }
                ]
            },
        ]
        const { nodes, edges } = buildHierarchy(data);
        setNodes(nodes);
        setEdges(edges);
        getGlOffset([...nodes]);
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

    /*const handleAddNode = () => {
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
    };*/

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
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                    >
                        Add Node
                    </button>
                    <button
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
