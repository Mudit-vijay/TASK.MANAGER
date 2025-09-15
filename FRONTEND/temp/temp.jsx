import React, { useEffect, useState } from "react";
import { groupService, taskSERVICES } from "../../services/api";

const TaskManager = () => {
  const [newTaskName, setNewTaskName] = useState("");
  const [group, setGroup] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    const getAllGroups = async () => {
      try {
        const result = await groupService.getGroups();
        console.log(result, "Groups fetched");
        setGroup(result);
      } catch (err) {
        console.log("Error fetching groups:", err);
      }
    };

    getAllGroups();
  }, []);

  const handleDeleteGroup = async (id) => {
    await groupService.deleteGroup(id);
    setGroup((prev) => prev.filter((group) => group._id !== id));
  };

  const handleUpdateGroup = async (id, body) => {
    await groupService.updateGroup(id, body);
    setGroup((prev) => prev.filter((group) => group._id !== id));
  };

  const createGroup = async (name, val) => {
    try {
      const response = await groupService.createGroups(name, val);
      setGroup([response]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateTask = async (groupID, name) => {
    await taskSERVICES.createTASK(groupID, name);
  };
  const handleDeleteTask = async (groupId, taskId) => {
    await taskSERVICES.deleteTASK(groupId, taskId);
  };
  const handleUpdateTask = async (groupId, taskId, data) => {
    await taskSERVICES.updateTASK(groupId, taskId, data);
  };
  const newArr = group?.data?.map((item) => item);

  let updateGroupData = { name: "group-99" };

  const renderGroup = newArr?.map((grp) => (
    <div
      key={grp._id}
      className="bg-gray-900 rounded-xl p-6 shadow-md mb-6 border border-gray-700"
    >
      <h3 className="text-xl font-semibold text-white mb-3">{grp.name}</h3>

      <div className="flex space-x-4 mb-4">
        <button
          className="text-red-700 p-3 rounded-md"
          onClick={() => handleDeleteGroup(grp._id)}
        >
          Delete Group
        </button>

        <button
          className="text-white bg-blue-600 p-3 rounded-md"
          onClick={() => handleUpdateGroup(grp._id, updateGroupData)}
        >
          Update Group
        </button>
      </div>

      <div className="mt-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Enter new task name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className="p-2 rounded-md text-black flex-grow"
        />

        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md"
          onClick={() => {
            handleCreateTask(grp._id, newTaskName);
            setNewTaskName("");
          }}
        >
          + Add Task
        </button>
      </div>

      {/* Display tasks */}
      <ul className="mt-4 space-y-2">
        {grp.tasks?.length === 0 ? (
          <li className="text-gray-400">No tasks in this group</li>
        ) : (
          grp.tasks.map((taskItem) => (
            <li
              key={taskItem._id}
              className="flex justify-between items-center bg-gray-800 p-3 rounded-md"
            >
              <span className="text-green-400">{taskItem.name}</span>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                onClick={() =>
                  handleUpdateTask(grp._id, taskItem._id, "qwerty")
                }
              >
                Update Task
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                onClick={() => handleDeleteTask(grp._id, taskItem._id)}
              >
                Delete Task
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  ));

  return (
    <div className="max-w-4xl mx-auto px-6 mt-10 pt-10">
      <h2 className="text-4xl font-bold text-white text-center mb-8">
        Task Manager
      </h2>

      {/* Create New Group */}
      <div className="flex items-center space-x-4 mb-8">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name"
          className="w-full px-4 py-2 rounded-md text-black"
        />
        <button
          onClick={() => createGroup(newGroupName, false)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-md"
        >
          + Add Group
        </button>
      </div>

      {newArr?.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No groups found</p>
      ) : (
        <div className="space-y-6">{renderGroup}</div>
      )}
    </div>
  );
};

export default TaskManager;
