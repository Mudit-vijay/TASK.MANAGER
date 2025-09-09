import React, { useEffect, useState } from "react";
// import { useTasks } from "../../hooks/useTasks";
import { groupService, taskSERVICES } from "../../services/api";
// import { useDispatch, useSelector } from "react-redux";

const TaskManager = () => {
  const [group, setGroup] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [task, setAllTask] = useState([]);
  // const token = localStorage.getItem("token");

  useEffect(() => {
    const getallgroups = async () => {
      try {
        const result = await groupService.getGroups();

        setGroup(result);
      } catch (err) {
        console.log("Error fetching groups:", err);
      }
    };
    getallgroups(); // only call if token exists
  }, []);

  const groupitems = [];

  const getALLTASK = async (id) => {
    return await taskSERVICES.getALLTASKS(id);
  };

  useEffect(() => {
    const buildGroupItems = async () => {
      for (let i = 0; i < group.length; i++) {
        const response = getALLTASK(group[i]._id);

        setAllTask((prev) => [...prev, response]);
        groupitems[i] = [];
        for (let j = 0; j < task.length; j++) {
          groupitems[i].push(
            <li
              key={task[j]._id}
              className="flex items-center justify-between p-2 bg-gray-800 rounded-md mb-2 hover:bg-gray-700 transition"
            >
              <span className="text-gray-200">{task[j].name}</span>
              <button
                onClick={() => handledelete(task[j]._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Delete
              </button>
            </li>
          );
        }
      }
    };
    buildGroupItems();
  }, [setGroup]);

  const creategroup = async (a, val) => {
    try {
      const response = await groupService.createGroups(a, val);
      //response.group.name
      setGroup(() => [response]);
    } catch (err) {
      console.log(err);
    }
  };

  const handledelete = async (id) => {
    await groupService.deleteGroup(id);
    setGroup((prev) => prev.filter((group) => group._id != id));
  };

  // const { loading, error } = useTasks();

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-64 text-gray-300">
  //       <div className="text-xl animate-pulse">Loading tasks...</div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex justify-center items-center h-64 text-red-400">
  //       <div className="text-xl">Error: {error}</div>
  //     </div>
  //   );
  // }

  const newArr = group?.data?.map((item) => {
    return item;
  });
  // console.log(newArr);
  const renderGroup = newArr?.map((groupName) => (
    <div
      key={groupName._id}
      className="bg-gray-900 rounded-xl p-5 shadow-md mb-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-3">
        {groupName.name}
      </h3>
      <ul>{groupName.name}</ul>
      <button
        onClick={() => {
          handledelete(groupName._id);
        }}
      >
        delete group
      </button>
    </div>
  ));
  return (
    <div className="max-w-3xl mx-auto px-4 mt-10 pt-10">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
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
          onClick={() => creategroup(newGroupName, false)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-md"
        >
          + Add Group
        </button>
      </div>
      {group.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No groups found</p>
      ) : (
        <div className="space-y-4">{renderGroup}</div>
      )}
    </div>
  );
};

export default TaskManager;
