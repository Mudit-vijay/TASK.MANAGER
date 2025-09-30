/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Calendar,
  Users,
  Folder,
  Plus,
  ChevronRight,
  Clock,
  Video,
  X,
  Trash,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import { groupService, taskSERVICES } from "../src/services/api.js";
import axios from "axios";

const GroupsView = () => {
  const [group, setGroup] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  const navigateBack = () => {
    // localStorage.removeItem("diskspace")
    navigate("workspaceView");
  };
  const getAllGroups = async () => {
    try {
      // cosnt id=localStorage.getItem("diskspaceid")
      const result = await groupService.getGroups();
      setGroup(result);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };
  useEffect(() => {
    getAllGroups();
  }, []);
  const createGroup = async (data) => {
    try {
      const response = await groupService.createGroups(data.name, data.state);
      getAllGroups();
    } catch (err) {
      console.error(err);
      alert("not able to craete group right now try after some time");
    }
  };
  const updateGroup = async (index, newName) => {
    try {
      // const id=localStorage.getItem("diskspace")
      await groupService.updateGroup(index, newName);
      getAllGroups();
    } catch (err) {
      console.error(err);
    }
  };
  const deleteGroup = async (index) => {
    try {
      await groupService.deleteGroup(index);
      getAllGroups();
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreate = () => {
    if (groupName.trim() === "") return;
    createGroup(groupName);
    setGroupName("");
    setShowForm(false);
  };

  const handleUpdate = (index) => {
    if (newName.trim() === "") return;
    updateGroup(index, newName);
    setEditingIndex(null);
    setNewName("");
  };

  const handleDelete = (index) => {
    deleteGroup(index);
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {group?.map((group, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 h-44 flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors cursor-pointer" />
            </div>

            {editingIndex === index ? (
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 w-full"
                />
                <button
                  onClick={() => handleUpdate(index)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingIndex(null)}
                  className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {group}
              </h3>
            )}

            <p className="text-gray-600 text-sm mb-2 flex-grow">
              Click to view tasks and members
            </p>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
              <span>{Math.floor(Math.random() * 8) + 3} tasks</span>
              <span>{Math.floor(Math.random() * 5) + 2} members</span>
            </div>

            {/* Update + Delete buttons */}
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setEditingIndex(index);
                  setNewName(group);
                }}
                className="flex items-center px-2 py-1 text-sm bg-yellow-400 text-white rounded-md hover:bg-yellow-500"
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDelete(index)}
                className="flex items-center px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create new group */}
      <button className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-6 transition-colors duration-200 mt-6">
        <div className="flex flex-col items-center space-y-2">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200"
            >
              <Plus className="w-6 h-6 text-gray-600" />
              <span className="text-gray-600 font-medium">
                Create New Group
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleCreate}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </button>
    </>
  );
};
export default GroupsView;
//   <div className="w-full space-y-8">
//     {/* Header */}
//     <div className="flex items-center justify-between">
//       <div className="flex items-center space-x-4">
//         <button
//           onClick={handleBackToWorkspaces}
//           className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <ChevronRight className="w-5 h-5 text-gray-600 transform rotate-180" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {selectedWorkspace?.name}
//           </h1>
//           <p className="text-gray-600 mt-2">{selectedWorkspace?.description}</p>
//         </div>
//       </div>
//       <button
//         className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
//         onClick={() => alert("Meeting scheduler opened!")}
//       >
//         <Video className="w-5 h-5" />
//         <span className="font-medium">Schedule Meeting</span>
//       </button>
//     </div>

//     {/* Workspace Info */}
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//       <div className="flex items-center space-x-6">
//         <div
//           className={`w-16 h-16 ${
//             selectedWorkspace?.color || "bg-indigo-500"
//           } rounded-xl flex items-center justify-center`}
//         >
//           <Folder className="w-8 h-8 text-white" />
//         </div>
//         <div className="flex-1">
//           <div className="grid grid-cols-3 gap-8">
//             <div>
//               <p className="text-sm text-gray-500">Team Members</p>
//               <p className="text-2xl font-bold text-gray-900 mt-1">
//                 {selectedWorkspace?.memberCount}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Creator</p>
//               <p className="text-lg font-semibold text-gray-900 mt-1">
//                 {selectedWorkspace?.creatorName}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Role</p>
//               <p className="text-lg font-semibold text-gray-900 mt-1">
//                 {selectedWorkspace?.role}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
