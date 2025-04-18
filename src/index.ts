import express, { Request, Response, NextFunction } from 'express';
import './config/db';
import './config/env';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  next()
})
app.use(router);

app.use(errorHandler)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
