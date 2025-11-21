import {
    createGroup,
    getGroupById,
    getGroups,
    updateGroup,
    deleteGroup,
    addMember,
    createJoinRequest,
    getJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
    getGroupsForUser,
    isUserInGroup
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

    // Join request logic
    createJoinRequest: async (groupId, userId) => {
        const isMember = await isUserInGroup(userId, groupId);
        if (isMember) return { error: "ALREADY_MEMBER" };

        const result = await createJoinRequest(groupId, userId);

        if (result?.error === "PENDING_EXISTS") {
            return { error: "PENDING_EXISTS" };
        }

        return result;
    },

    getJoinRequests: async (groupId) => {
        return await getJoinRequests(groupId);
    },

    acceptJoin: async (requestId) => {
        return await acceptJoinRequest(requestId);
    },

    rejectJoin: async (requestId) => {
        return await rejectJoinRequest(requestId);
    },

    getUserGroups: async (userId) => {
        return await getGroupsForUser(userId);
    }
};