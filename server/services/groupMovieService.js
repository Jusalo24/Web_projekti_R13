import { addMovie, removeMovie, getGroupMovies } from "../models/groupMovieModel.js";

export default {
    addMovie: async (groupId, movieId, mediaType, userId) =>
        await addMovie(groupId, movieId, mediaType, userId),

    removeMovie: async (groupId, movieId, mediaType) =>
        await removeMovie(groupId, movieId, mediaType),

    getMovies: async (groupId) =>
        await getGroupMovies(groupId),
};