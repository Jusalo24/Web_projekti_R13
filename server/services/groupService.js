import * as groupModel from "../models/groupModel.js";

// Create a new group
export async function createGroup(ownerId, { name, description }) {
    const group = await groupModel.createGroup(ownerId, name, description);
    
    // Automatically add owner as member with 'owner' role
    await groupModel.addMember(group.id, ownerId, 'owner');
    
    return group;
}

// Get single group by ID with members
export async function getGroupById(groupId) {
    return await groupModel.getGroupById(groupId);
}

// Get all visible/public groups
export async function getGroups() {
    return await groupModel.getGroups();
}

// Get groups user belongs to
export async function getUserGroups(userId) {
    return await groupModel.getGroupsForUser(userId);
}

// Update group details
export async function updateGroup(groupId, { name, description, isVisible }) {
    return await groupModel.updateGroup(groupId, name, description, isVisible);
}

// Delete a group
export async function deleteGroup(groupId) {
    await groupModel.deleteGroup(groupId);
}

// Add member to group
export async function addMember(groupId, userId, role = "member") {
    return await groupModel.addMember(groupId, userId, role);
}

// Create join request
export async function createJoinRequest(groupId, userId) {
    // Check if user is already a member
    const isMember = await groupModel.isUserInGroup(userId, groupId);
    if (isMember) {
        return { error: "ALREADY_MEMBER" };
    }
    
    return await groupModel.createJoinRequest(groupId, userId);
}

// Get join requests for a group
export async function getJoinRequests(groupId) {
    return await groupModel.getJoinRequests(groupId);
}

// Accept join request
export async function acceptJoin(requestId) {
    return await groupModel.acceptJoinRequest(requestId);
}

// Reject join request
export async function rejectJoin(requestId) {
    return await groupModel.rejectJoinRequest(requestId);
}

export default {
    createGroup,
    getGroupById,
    getGroups,
    getUserGroups,
    updateGroup,
    deleteGroup,
    addMember,
    createJoinRequest,
    getJoinRequests,
    acceptJoin,
    rejectJoin
};