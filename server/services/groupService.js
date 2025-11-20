import {
    createGroup,
    getGroupById,
    getGroups,
    updateGroup,
    deleteGroup,
    addMember,
    createJoinRequest,
    getJoinRequests,
} from "../models/groupModel.js";

export default {
    createGroup: async (ownerId, data) => {
        return await createGroup(ownerId, data.name, data.description);
    },

    getGroupById: async (groupId) => {
        return await getGroupById(groupId);
    },

    getGroups: async () => {
        return await getGroups();
    },

    updateGroup: async (groupId, data) => {
        return await updateGroup(
            groupId,
            data.name,
            data.description,
            data.isVisible
        );
    },

    deleteGroup: async (groupId) => {
        return await deleteGroup(groupId);
    },

    addMember: async (groupId, userId) => {
        return await addMember(groupId, userId);
    },

    createJoinRequest: async (groupId, userId) => {
        return await createJoinRequest(groupId, userId);
    },

    getJoinRequests: async (groupId) => {
        return await getJoinRequests(groupId);
    },
};