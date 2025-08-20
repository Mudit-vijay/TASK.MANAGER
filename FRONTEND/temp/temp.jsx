import React, { useState, useEffect } from "react";
import api from './api'; // adjust this path if needed
import {
    DndContext,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    useDroppable
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString({
            ...transform,
            scaleX: isDragging ? 1.05 : 1,
            scaleY: isDragging ? 1.05 : 1,
            rotate: isDragging ? 3 : 0
        }),
        transition: "transform 200ms ease"
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`py-1 cursor-move px-2 rounded-lg my-2 ${isDragging ? "shadow-lg" : ""}`}
        >
            {id}
        </div>
    );
}

function DroppableContainer({ id, items, children }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const { attributes, listeners } = useSortable({ id });
    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`rounded-lg bg-gray-800 p-4 min-w-[200px] ${isOver ? "ring-2 ring-blue-400" : ""}`}
        >
            <h3 className="mb-2 text-white">{id}</h3>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </div>
    );
}

export default function TaskManager() {
    const [cardOrder, setCardOrder] = useState([]);
    const [lists, setLists] = useState({});
    const [newTask, setNewTask] = useState("");
    const [newGroup, setNewGroup] = useState("");

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        fetchGroupsAndTasks();
    }, []);

    const fetchGroupsAndTasks = async () => {
        try {
            const groupsResponse = await api.taskapi.get('/task/groups');
            const taskList = {};
            const order = [];

            for (const group of groupsResponse.data.groups) {
                order.push(group._id);
                const taskIds = group.tasks || [];
                const taskTitles = [];

                for (const id of taskIds) {
                    const taskRes = await api.taskapi.get(`/task/group/${group._id}/task/${id}`);
                    taskTitles.push(taskRes.data.task.name);
                }

                taskList[group._id] = taskTitles;
            }

            setCardOrder(order);
            setLists(taskList);
        } catch (err) {
            console.error("Error fetching tasks/groups:", err);
        }
    };

    const createGroup = async () => {
        if (!newGroup.trim()) return;
        try {
            const res = await api.taskapi.post('/task/group', { name: newGroup });
            await fetchGroupsAndTasks();
            setNewGroup("");
        } catch (err) {
            console.error("Error creating group:", err);
        }
    };

    const createTask = async (groupId) => {
        if (!newTask.trim()) return;
        try {
            await api.taskapi.post(`/task/group/${groupId}`, { name: newTask });
            await fetchGroupsAndTasks();
            setNewTask("");
        } catch (err) {
            console.error("Error creating task:", err);
        }
    };

    const findContainer = (itemId) => {
        for (const key of Object.keys(lists)) {
            if (lists[key].includes(itemId)) {
                return key;
            }
        }
        return null;
    };

    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        if (cardOrder.includes(active.id) && cardOrder.includes(over.id)) {
            const oldIndex = cardOrder.indexOf(active.id);
            const newIndex = cardOrder.indexOf(over.id);
            setCardOrder(arrayMove(cardOrder, oldIndex, newIndex));
            return;
        }

        const activeContainer = findContainer(active.id);
        const overContainer = cardOrder.includes(over.id) ? over.id : findContainer(over.id);
        if (!activeContainer || !overContainer) return;

        if (activeContainer === overContainer) {
            const activeIndex = lists[activeContainer].indexOf(active.id);
            const overIndex = lists[overContainer].indexOf(over.id);
            setLists(prev => ({
                ...prev,
                [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex)
            }));
        } else {
            const newActive = [...lists[activeContainer]];
            newActive.splice(newActive.indexOf(active.id), 1);

            const newOver = [...lists[overContainer]];
            const overIndex = lists[overContainer].indexOf(over.id);
            const insertAt = overIndex >= 0 ? overIndex : newOver.length;
            newOver.splice(insertAt, 0, active.id);

            setLists(prev => {
                const updatedLists = {
                    ...prev,
                    [activeContainer]: newActive,
                    [overContainer]: newOver
                };
                const cleanedLists = {};
                const updatedCardOrder = [];
                for (const cardId of cardOrder) {
                    if (updatedLists[cardId]?.length) {
                        cleanedLists[cardId] = updatedLists[cardId];
                        updatedCardOrder.push(cardId);
                    }
                }
                setCardOrder(updatedCardOrder);
                return cleanedLists;
            });
        }
    };

    return (
        <div className="p-4">
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    placeholder="New group name"
                    className="p-2 border rounded"
                />
                <button onClick={createGroup} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Create Group
                </button>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New task"
                    className="p-2 border rounded"
                />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
                    <div className="flex gap-4 text-white">
                        {cardOrder.map(cardId => (
                            <DroppableContainer key={cardId} id={cardId} items={lists[cardId]}>
                                {lists[cardId]?.map(item => (
                                    <SortableItem key={item} id={item} />
                                ))}
                                {lists[cardId]?.length === 0 && <div className="p-2 italic">Drop here</div>}
                                <button
                                    onClick={() => createTask(cardId)}
                                    className="mt-2 bg-white text-black rounded px-2 py-1 text-sm"
                                >
                                    Add Task
                                </button>
                            </DroppableContainer>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
