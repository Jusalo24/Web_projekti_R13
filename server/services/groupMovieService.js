import { addMovie, removeMovie, getGroupMovies } from "../models/groupMovieModel.js";

export default {
    addMovie: async (groupId, movieId, userId) =>
        await addMovie(groupId, movieId, userId),

    removeMovie: async (groupId, movieId) =>
        await removeMovie(groupId, movieId),

    getMovies: async (groupId) =>
        await getGroupMovies(groupId),
};