import express from 'express';
import type { Express, Request, Response } from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => res.send('Hello World!!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
