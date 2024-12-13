const experss = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");
const fileUpload = require('express-fileupload');
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const gameRoutes = require("./routes/gameRoutes");


const app = experss();
app.use(experss.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(cookieParser());

app.use(cors("origin", "*"));
app.use(fileUpload());

app.get('/home',(req, res)=>{
  res.send("hii")
})


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/game", gameRoutes);


app.use(errorMiddleware);
module.exports = app;

