import express, { type Request, type Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRouter from './routes/auth.routes';
import menuRouter from './routes/menu.routes';
import ordersRouter from './routes/orders.routes';
import categoriesRouter from './routes/categories.routes';
import featuredRouter from './routes/featured.routes';
import contactRouter from './routes/contact.routes';
import wishlistRouter from './routes/wishlist.routes';
import blogsRouter from './routes/blogs.routes';
import notFound from './middleware/notFound';
import errorHandler from './middleware/errorHandler';

const app = express();

const corsOrigin: string = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin.split(",") }));
app.use(express.json());
app.use(morgan("dev"));

// Health check — useful to confirm the API is deployed and reachable
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "API is up and running." });
});

app.use("/api/auth", authRouter);
app.use("/api/menu", menuRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/featured", featuredRouter);
app.use("/api/contact", contactRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/blogs", blogsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
