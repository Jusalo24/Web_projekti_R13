import express from 'express';
import moviesRouter from './routes/movies.js';


const app = express();
app.use('/movies', moviesRouter);

app.listen(3001, () => console.log('Serveri käynnissä portissa 3001'));
