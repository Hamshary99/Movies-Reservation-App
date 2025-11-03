import api from "../apiConfig";

export const userProfileService = {
    getUserProfile: async () => {
        const response = await api.get(`/user/profile`);
        return response.data.user;
    },
    updateUserProfile: async (userId, profileData) => {
        const response = await api.put(`/user/profile/${userId}`, profileData);
        return response.data.user;
    },
    deleteUserProfile: async (userId) => {
        const response = await api.delete(`/user/profile/${userId}`);
        return response.data.user;
    },
    changePassword: async (passwordData) => {
        const response = await api.put(`/auth/changePassword`, passwordData);
        return response.data.user;
    }
}