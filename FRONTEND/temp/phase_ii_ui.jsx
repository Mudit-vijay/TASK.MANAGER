import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Calendar, Users, Folder, Plus, ChevronRight, Clock, Video, X, Trash, LogOut } from 'lucide-react';

const phase_ii_ui = () => {
    const [currentView, setCurrentView] = useState('workspaces');
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
        watch
    } = useForm({
        defaultValues: {
            name: '',
            role: 'ADMIN',
            description: '',
            creatorName: '',
            members: [{ email: '', role: 'VIEWER' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'members'
    });

    const CREATE_WORKSPACE_MUTATION = `
        mutation CreateWorkspace(
            $name: String!, 
            $role: Role!, 
            $description: String!, 
            $creatorName: String!, 
            $members: [WorkspaceMemberInput!]!
        ) {
            createWorkspace(
                name: $name, 
                role: $role, 
                description: $description, 
                creatorName: $creatorName, 
                members: $members
            ) {
                id
                name
                creatorName
                role
                member {
                    email
                    role
                }
            }
        }
    `;

    const deleteworkspace = `
    mutation deleteWorkspace($id: ID!){
    deleteWorkspace(id: $id)
    }`;

    const GET_WORKSPACES_QUERY = `
        query GetWorkspaces {
            allWorkspaces {
                id
                name
                creatorName
                role
                member {
                    email
                    role
                }
            }
        }
    `;

    // Add new member
    const addMember = () => {
        append({ email: '', role: 'VIEWER' });
    };

    // Remove member
    const removeMember = (index) => {
        remove(index);
    };

    const deleteWorkspace = async (id) => {
        const d_variables = {
            id: id
        }
        try {
            const response = await fetch("http://localhost:9999/graphql", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: deleteworkspace,
                    variables: d_variables,
                }),
            });
            console.log(response);
            // Refresh workspaces after deletion
            fetchWorkspaces();
        }
        catch (err) {
            console.log(err)
        }
    }

    // Create workspace with React Hook Form
    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        setSuccess('');

        try {
            // Validate members
            const validMembers = data.members.filter(member => member.email.trim() !== '');
            if (validMembers.length === 0) {
                throw new Error('Please add at least one member');
            }

            const variables = {
                name: data.name.trim(),
                role: data.role,
                description: data.description.trim(),
                creatorName: data.creatorName.trim(),
                members: validMembers
            };

            const response = await fetch("http://localhost:9999/graphql", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: CREATE_WORKSPACE_MUTATION,
                    variables: variables,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData.errors) {
                throw new Error(responseData.errors[0].message);
            }

            if (responseData.data && responseData.data.createWorkspace) {
                const newWorkspace = {
                    ...responseData.data.createWorkspace,
                    memberCount: responseData.data.createWorkspace.member ? responseData.data.createWorkspace.member.length : 0,
                    groupCount: 0,
                    color: 'bg-indigo-500',
                    groups: []
                };
                setWorkspaces(prev => [...prev, newWorkspace]);
                setSuccess('Workspace created successfully!');
                setShowCreateModal(false);

                // Reset form
                reset({
                    name: '',
                    role: 'ADMIN',
                    description: '',
                    creatorName: '',
                    members: [{ email: '', role: 'VIEWER' }]
                });
            }

        } catch (err) {
            console.error('Error creating workspace:', err);
            setError(err.message || 'Failed to create workspace');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all workspaces
    const fetchWorkspaces = async () => {
        try {
            const response = await fetch("http://localhost:9999/graphql", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: GET_WORKSPACES_QUERY,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
            } else if (data.data && data.data.allWorkspaces) {
                // Transform data to match UI expectations
                const transformedWorkspaces = data.data.allWorkspaces.map(workspace => ({
                    ...workspace,
                    memberCount: workspace.member ? workspace.member.length : 0,
                    description: workspace.description || 'No description provided',
                    color: 'bg-indigo-500',
                    groupCount: 0,
                    groups: []
                }));
                setWorkspaces(transformedWorkspaces);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        }
    };

    // Load workspaces on component mount
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleWorkspaceClick = (workspace) => {
        setSelectedWorkspace(workspace);
        setCurrentView('groups');
    };

    const handleBackToWorkspaces = () => {
        setCurrentView('workspaces');
        setSelectedWorkspace(null);
    };

    const CreateWorkspaceModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Create New Workspace</h2>
                    <button
                        onClick={() => setShowCreateModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Workspace Name *
                            </label>
                            <input
                                type="text"
                                {...register('name', {
                                    required: 'Workspace name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                })}
                                className={`w-full p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : ''
                                    }`}
                                placeholder="Enter workspace name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Role
                            </label>
                            <select
                                {...register('role')}
                                className="w-full p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Creator Name *
                        </label>
                        <input
                            type="text"
                            {...register('creatorName', {
                                required: 'Creator name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                            })}
                            className={`w-full p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.creatorName ? 'border-red-500' : ''
                                }`}
                            placeholder="Enter your name"
                        />
                        {errors.creatorName && (
                            <p className="mt-1 text-sm text-red-600">{errors.creatorName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            {...register('description', {
                                required: 'Description is required',
                                minLength: { value: 10, message: 'Description must be at least 10 characters' }
                            })}
                            rows={3}
                            className={`w-full p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''
                                }`}
                            placeholder="Describe your workspace"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Members */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Members
                            </label>
                            <button
                                type="button"
                                onClick={addMember}
                                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Member
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-3">
                                    <input
                                        type="email"
                                        {...register(`members.${index}.email`, {
                                            required: index === 0 ? 'At least one member email is required' : false,
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        placeholder="Email address"
                                        className={`flex-1 p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.members?.[index]?.email ? 'border-red-500' : ''
                                            }`}
                                    />
                                    <select
                                        {...register(`members.${index}.role`)}
                                        className="w-32 p-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="VIEWER">Viewer</option>
                                    </select>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMember(index)}
                                            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.members && (
                            <p className="mt-1 text-sm text-red-600">Please provide valid member information</p>
                        )}
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${loading
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Creating...' : 'Create Workspace'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const WorkspacesView = () => (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
                    <p className="text-gray-600 mt-2">Select a workspace to view groups and tasks</p>
                </div>
                <div className='flex flex-row gap-3'>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                        onClick={() => alert('Meeting scheduler opened!')}
                    >
                        <Video className="w-5 h-5" />
                        <span className="font-medium">Schedule Meeting</span>
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 rounded-xl px-8 py-4 transition-colors duration-200"
                    >
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Plus className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600 font-medium">Create New Workspace</span>
                        </div>
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Workspaces</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{workspaces.length}</p>
                        </div>
                        <Folder className="w-10 h-10 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Members</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{workspaces.reduce((sum, w) => sum + w.memberCount, 0)}</p>
                        </div>
                        <Users className="w-10 h-10 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Workspaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                    <div
                        key={workspace.id}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 relative group h-56"
                    >
                        {/* Delete button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteWorkspace(workspace.id);
                            }}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash className="w-4 h-4" />
                        </button>

                        {/* Workspace content */}
                        <button
                            onClick={() => handleWorkspaceClick(workspace)}
                            className="w-full h-full text-left"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 ${workspace.color || 'bg-indigo-500'} rounded-lg flex items-center justify-center`}>
                                    <Folder className="w-6 h-6 text-white" />
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{workspace.name}</h3>
                            <p className="text-gray-600 mb-4 text-sm line-clamp-3">{workspace.description}</p>

                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {workspace.memberCount} members
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Created by {workspace.creatorName}
                                    </span>
                                </div>
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const GroupsView = () => (
        <div className="w-full space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleBackToWorkspaces}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 transform rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{selectedWorkspace?.name}</h1>
                        <p className="text-gray-600 mt-2">{selectedWorkspace?.description}</p>
                    </div>
                </div>
                <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => alert('Meeting scheduler opened!')}
                >
                    <Video className="w-5 h-5" />
                    <span className="font-medium">Schedule Meeting</span>
                </button>
            </div>

            {/* Workspace Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 ${selectedWorkspace?.color || 'bg-indigo-500'} rounded-xl flex items-center justify-center`}>
                        <Folder className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="grid grid-cols-3 gap-8">
                            <div>
                                <p className="text-sm text-gray-500">Team Members</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{selectedWorkspace?.memberCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Creator</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedWorkspace?.creatorName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedWorkspace?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedWorkspace?.groups?.map((group, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 cursor-pointer group h-36"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{group}</h3>
                        <p className="text-gray-600 text-sm mb-4">Click to view tasks and members</p>

                        <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                            <span>{Math.floor(Math.random() * 8) + 3} tasks</span>
                            <span>{Math.floor(Math.random() * 5) + 2} members</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Group Button */}
            <button className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-6 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center space-y-2">
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600 font-medium">Create New Group</span>
                </div>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="w-70% mx-auto">
                {currentView === 'workspaces' ? <WorkspacesView /> : <GroupsView />}
                {showCreateModal && <CreateWorkspaceModal />}
            </div>
        </div>
    );
};

export default phase_ii_ui;