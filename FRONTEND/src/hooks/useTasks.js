
import { useState, useEffect } from 'react';
import { groupService } from '../services/api';

export const useTasks = () => {
    const [group, setGroup] = useState([])
    const [cardOrder, setCardOrder] = useState([]);
    const [lists, setLists] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true);
                setGroup(await groupService.getGroups());
                if (group.length == 0) {
                    alert("no tasks are present")
                }
                const newCardOrder = groups.map(group => group.name);
                const newLists = {};

                groups.forEach(group => {
                    newLists[group.name] = group.tasks || [];
                });

                setCardOrder(newCardOrder);
                setLists(newLists);
            } catch (err) {
                console.error('Error fetching group data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const findContainer = (itemId) => {
        return Object.keys(lists).find(key =>
            lists[key].some(item => item._id === itemId)
        ) || null;
    };

    return {
        cardOrder,
        setCardOrder,
        lists,
        setLists,
        loading,
        error,
        findContainer
    };
};