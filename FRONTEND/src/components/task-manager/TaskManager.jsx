import React, { useEffect, useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { groupService, taskSERVICES } from "../../services/api";
import { useDispatch, useSelector } from "react-redux";

const TaskManager = () => {
  const [group, setGroup] = useState([]);
  const [task, setAllTask] = useState([]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const getallgroups = async () => {
      try {

        const response = await groupService.getGroups();
        console.log(response.typeof())

        console.log("Groups fetched:", response);
        setGroup(response);
      } catch (err) {
        console.log("Error fetching groups:", err);
      }
    };
    if (token) getallgroups();  // only call if token exists
  }, []);


  const groupitems = [];

  const getALLTASK = async (id) => {
    return await taskSERVICES.getALLTASKS(id);
  };

  useEffect(() => {
    const buildGroupItems = async () => {
      for (let i = 0; i < group.length; i++) {
        const response = getALLTASK(group[i]._id);
        console.log(response);
        console.log("task service api call ")
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

  const creategroup = async () => {
    try {
      console.log("request comes here ")
      const response = await groupService.createGroups("testing-4", false);
      setGroup((prev) => [...prev, response]);
    } catch (err) {
      console.log(err);
    }
  };

  const handledelete = async (id) => {
    await taskSERVICES.deleteTASK(id);
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

  const renderGroup = [];
  for (let i = 0; i < groupitems.length; i++) {
    renderGroup.push(
      <div
        key={group[i]._id}
        className="bg-gray-900 rounded-xl p-5 shadow-md mb-6 border border-gray-700"
      >
        <h3 className="text-lg font-semibold text-white mb-3">
          {group[i].name}
        </h3>
        <ul>{groupitems[i]}</ul>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 mt-5">
      <div className="flex justify-between items-center my-6">
        <h2 className="text-2xl font-bold text-white">Your Groups</h2>
        <button
          onClick={creategroup}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          + Create New Group
        </button>
      </div>

      <div>
        {group.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No groups found</p>
        ) : (
          <div className="space-y-4">{renderGroup}</div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;



