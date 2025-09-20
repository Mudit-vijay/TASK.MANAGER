import React, { useState } from 'react';
import { Calendar, Users, Folder, Plus, ChevronRight, Clock, Video } from 'lucide-react';

const phase_ii_ui = () => {
    const [currentView, setCurrentView] = useState('workspaces');
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);

    // Sample workspace data
    const workspaces = [
        {
            id: 1,//done
            name: 'Marketing Team',//done
            description: 'Brand campaigns and content creation',
            memberCount: 12,//done
            role:"ADMIN"//done
        },
    ];

    const handleWorkspaceClick = (workspace) => {
        setSelectedWorkspace(workspace);
        setCurrentView('groups');
    };

    const handleBackToWorkspaces = () => {
        setCurrentView('workspaces');
        setSelectedWorkspace(null);
    };

    const WorkspacesView = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Task Manager</h1>
                    <p className="text-gray-300 mt-1">Select a workspace to view groups and tasks</p>
                </div>
                <button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => alert('Meeting scheduler opened!')}
                >
                    <Video className="w-5 h-5" />
                    <span className="font-medium">Schedule Meeting</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Workspaces</p>
                            <p className="text-2xl font-bold text-white">{workspaces.length}</p>
                        </div>
                        <Folder className="w-10 h-10 text-blue-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Members</p>
                            <p className="text-2xl font-bold text-white">{workspaces.reduce((sum, w) => sum + w.memberCount, 0)}</p>
                        </div>
                        <Users className="w-10 h-10 text-green-400" />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Groups</p>
                            <p className="text-2xl font-bold text-white">{workspaces.reduce((sum, w) => sum + w.groupCount, 0)}</p>
                        </div>
                        <Clock className="w-10 h-10 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Workspaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {workspaces.map((workspace) => (
                    <button
                        key={workspace.id}
                        onClick={() => handleWorkspaceClick(workspace)}
                        className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700 hover:shadow-lg hover:border-gray-600 hover:bg-gray-750 transition-all duration-300 text-left group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${workspace.color} rounded-lg flex items-center justify-center`}>
                                <Folder className="w-6 h-6 text-white" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
                        </div>

                        <h3 className="text-xl font-semibold text-white mb-2">{workspace.name}</h3>
                        <p className="text-gray-400 mb-4 text-sm">{workspace.description}</p>

                        <div className="flex justify-between items-center">
                            <div className="flex space-x-4">
                                <span className="text-sm text-gray-500">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    {workspace.memberCount} members
                                </span>
                                <span className="text-sm text-gray-500">
                                    <Folder className="w-4 h-4 inline mr-1" />
                                    {workspace.groupCount} groups
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Add New Workspace Button */}
            <button className="w-full bg-gray-800 hover:bg-gray-750 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-xl p-8 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <Plus className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-300 font-medium">Create New Workspace</span>
                </div>
            </button>
        </div>
    );

    const GroupsView = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBackToWorkspaces}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-300 transform rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{selectedWorkspace?.name}</h1>
                        <p className="text-gray-300 mt-1">{selectedWorkspace?.description}</p>
                    </div>
                </div>
                <button
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => alert('Meeting scheduler opened!')}
                >
                    <Video className="w-5 h-5" />
                    <span className="font-medium">Schedule Meeting</span>
                </button>
            </div>

            {/* Workspace Info */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 ${selectedWorkspace?.color} rounded-xl flex items-center justify-center`}>
                        <Folder className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm text-gray-400">Team Members</p>
                                <p className="text-2xl font-bold text-white">{selectedWorkspace?.memberCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Active Groups</p>
                                <p className="text-2xl font-bold text-white">{selectedWorkspace?.groupCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedWorkspace?.groups.map((group, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700 hover:shadow-lg hover:border-gray-600 hover:bg-gray-750 transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-300" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-200 transition-colors" />
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">{group}</h3>
                        <p className="text-gray-400 text-sm mb-4">Click to view tasks and members</p>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{Math.floor(Math.random() * 8) + 3} tasks</span>
                            <span>{Math.floor(Math.random() * 5) + 2} members</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Group Button */}
            <button className="w-full bg-gray-800 hover:bg-gray-750 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-xl p-6 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-300 font-medium">Create New Group</span>
                </div>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {currentView === 'workspaces' ? <WorkspacesView /> : <GroupsView />}
            </div>
        </div>
    );
};

export default phase_ii_ui;