require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connectDB = require("./config/dbconfig");
const userRouter = require('./routes/userRoute');
const movieRouter = require("./routes/movieRoute");
const theatreRouter = require("./routes/theatreRoute");
const showRouter = require("./routes/showRoute");
const bookingRouter = require("./routes/bookingRoute");

const cors = require('cors');

const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
connectDB();

//Routes
app.use('/api/users', userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/theatres", theatreRouter);
app.use("/api/shows", showRouter);
app.use("/api/bookings", bookingRouter);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

app.listen(port, ()=> {
    console.log('Server is connected');
})