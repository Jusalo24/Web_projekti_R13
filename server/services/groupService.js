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

// Create a new group
// service: createGroup(ownerId, data) → model.createGroup(ownerId, name, description)
export default {
    createGroup: async (ownerId, data) => {
        return await createGroup(ownerId, data.name, data.description);
    },

    // Get one group by ID
    // service: getGroupById(groupId) → model.getGroupById(id)
    getGroupById: async (groupId) => {
        return await getGroupById(groupId);
    },

    // Get all visible groups
    // service: getGroups() → model.getGroups()
    getGroups: async () => {
        return await getGroups();
    },

    // Update group fields
    // service: updateGroup(id, data) → model.updateGroup(id, name, description, isVisible)
    updateGroup: async (groupId, data) => {
        return await updateGroup(
            groupId,
            data.name,
            data.description,
            data.isVisible
        );
    },

    // Delete group by ID
    // service: deleteGroup(id) → model.deleteGroup(id)
    deleteGroup: async (groupId) => {
        return await deleteGroup(groupId);
    },

    // Add member to group
    // service: addMember(groupId, userId) → model.addMember(groupId, userId)
    addMember: async (groupId, userId) => {
        return await addMember(groupId, userId);
    },

    // Create join request
    // service: createJoinRequest(groupId, userId) → model.createJoinRequest(groupId, userId)
    createJoinRequest: async (groupId, userId) => {
        return await createJoinRequest(groupId, userId);
    },

    // Get all pending join requests for group
    // service: getJoinRequests(groupId) → model.getJoinRequests(groupId)
    getJoinRequests: async (groupId) => {
        return await getJoinRequests(groupId);
    },

    // Accept join request
    // service: acceptJoin(requestId) → model.acceptJoinRequest(requestId)
    acceptJoin: async (requestId) => {
        return await acceptJoinRequest(requestId);
    },

    // Reject join request
    // service: rejectJoin(requestId) → model.rejectJoinRequest(requestId)
    rejectJoin: async (requestId) => {
        return await rejectJoinRequest(requestId);
    },
};