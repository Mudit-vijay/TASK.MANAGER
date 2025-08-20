import React, { useEffect, useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import groupService, { taskSERVICES } from "../../services/api";
const TaskManager = () => {
  const [group, setGroup] = useState([]);
  const [task, setAllTask] = useState([]);
  useEffect(() => {
    const getallgroups = async () => {
      try {
        const response = await groupService.getGroups();
        setGroup(response);
      } catch (err) {
        console.log(err);
      }
    };
    getallgroups();
  }, []);
  const groupitems = [];
  const getALLTASK = async (id) => {
    return await taskSERVICES.getALLTASKS(id);
    // setAllTask((prev) => [...prev, response]);
  };
  useEffect(() => {
    const buildGroupItems = async () => {
      for (let i = 0; i < group.length; i++) {
        const response = getALLTASK(group[i]._id);
        setAllTask((prev) => [...prev, response]);
        groupitems[i] = [];
        for (let j = 0; j < task.length; j++) {
          groupitems[i].push(
            <li key={task[j]._id}>
              {task[j].name}
              <button onClick={() => handledelete(task[j]._id)}>DELETE</button>
            </li>
          );
        }
      }
    };
    buildGroupItems();
  }, [setGroup]);
  const creategroup = async () => {
    try {
      const response = await groupService.creategroup("testing-4", false);
      setGroup((prev) => [...prev, response]);
    } catch (err) {
      console.log(err);
    }
  };
  const handledelete = async (id) => {
    await taskSERVICES.deleteTASK(id);
    setGroup((prev) => prev.filter((group) => group._id != id));
  };
  const { loading, error } = useTasks();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-white">
        <div className="text-xl">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-400">
        <div className="text-xl">Error: {error}</div>
      </div>
    );
  }
  const renderGroup = [];
  for (let i = 0; i < groupitems.length; i++) {
    renderGroup.push(
      <div>
        <h3>{group[i].name}</h3>
        <h3>{groupitems[i]}</h3>
      </div>
    );
  }
  return (
    <>
      <button
        onClick={creategroup}
        className="bg-blue-500 text-white px-4 py-2 rounded my-4"
      >
        Create New Group
      </button>

      <h2>your groups</h2>
      <div>
        {group.length === 0 ? <p>no groups found</p> : <ul>{renderGroup}</ul>}
      </div>
    </>
  );
};

export default TaskManager;
