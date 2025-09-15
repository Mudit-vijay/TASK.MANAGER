import React, { useEffect, useState } from "react";
import { groupService, taskSERVICES } from "../../services/api";

const TaskManager = () => {
  const [newTaskName, setNewTaskName] = useState({});
  const [group, setGroup] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [state, setState] = useState(false);
  const [groupUpdateInputs, setGroupUpdateInputs] = useState({});
  const [taskUpdateInputs, setTaskUpdateInputs] = useState({});

  useEffect(() => {
    const getAllGroups = async () => {
      try {
        const result = await groupService.getGroups();
        setGroup(result);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    getAllGroups();
  }, [state]);

  const handleDeleteGroup = async (id) => {
    await groupService.deleteGroup(id);
    setState(!state);
  };

  const handleUpdateGroup = async (id, body) => {
    await groupService.updateGroup(id, body);
    setState(!state);
  };

  const createGroup = async (name, val) => {
    try {
      const response = await groupService.createGroups(name, val);
      setGroup([response]);
      setState(!state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (groupID, name) => {
    await taskSERVICES.createTASK(groupID, name);
    setState(!state);
  };

  const handleDeleteTask = async (groupId, taskId) => {
    await taskSERVICES.deleteTASK(groupId, taskId);
    setState(!state);
  };

  const handleUpdateTask = async (groupId, taskId, data) => {
    await taskSERVICES.updateTASK(groupId, taskId, data);
    setState(!state);
  };

  const newArr = group?.data?.map((item) => item);

  const renderGroup = newArr?.map((grp) => (
    <div
      key={grp._id}
      className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-full"
    >
      <h3 className="text-2xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
        {grp.name}
      </h3>

      {/* Group Controls */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <input
            type="text"
            value={groupUpdateInputs[grp._id] || ""}
            onChange={(e) =>
              setGroupUpdateInputs({
                ...groupUpdateInputs,
                [grp._id]: e.target.value,
              })
            }
            placeholder="New group name"
            className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
            onClick={() =>
              handleUpdateGroup(grp._id, groupUpdateInputs[grp._id])
            }
          >
            Update Group
          </button>
        </div>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
          onClick={() => handleDeleteGroup(grp._id)}
        >
          Delete Group
        </button>

        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <input
            type="text"
            value={newTaskName[grp._id] || ""}
            onChange={(e) =>
              setNewTaskName({ ...newTaskName, [grp._id]: e.target.value })
            }
            placeholder="New task name"
            className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full sm:w-auto"
            onClick={() => {
              handleCreateTask(grp._id, newTaskName[grp._id]);
              setNewTaskName({ ...newTaskName, [grp._id]: "" });
            }}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {grp.tasks?.length === 0 ? (
          <p className="text-gray-400 italic text-center">No tasks yet</p>
        ) : (
          grp.tasks.map((taskItem) => (
            <div
              key={taskItem._id}
              className="bg-gray-700 rounded p-4 flex flex-col space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{taskItem.name}</span>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteTask(grp._id, taskItem._id)}
                >
                  COMPLETED
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <input
                  type="text"
                  value={taskUpdateInputs[taskItem._id] || ""}
                  onChange={(e) =>
                    setTaskUpdateInputs({
                      ...taskUpdateInputs,
                      [taskItem._id]: e.target.value,
                    })
                  }
                  placeholder="Update task name"
                  className="flex-1 px-3 py-2 rounded bg-gray-600 text-white border border-gray-500 focus:outline-none"
                />
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded w-full sm:w-auto"
                  onClick={() =>
                    handleUpdateTask(
                      grp._id,
                      taskItem._id,
                      taskUpdateInputs[taskItem._id]
                    )
                  }
                >
                  Update
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">Task Manager</h1>

      {/* Add New Group */}
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-10">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name"
          className="flex-1 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
        />
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded w-full sm:w-auto"
          onClick={() => {
            createGroup(newGroupName, false);
            setNewGroupName("");
          }}
        >
          Add Group
        </button>
      </div>

      {/* Responsive Group Cards */}
      {newArr?.length === 0 ? (
        <p className="text-gray-400 text-center text-lg">No groups available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {renderGroup}
        </div>
      )}
    </div>
  );
};

export default TaskManager;
