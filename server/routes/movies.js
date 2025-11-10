import express from 'express';
import fetch from 'node-fetch';
import { TMDB_API_KEY } from '../config/apiKeys';

const router = express.Router();
const BASE_URL = 'https://api.themoviedb.org/3';
