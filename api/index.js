const express = require("express");
const app = express();
app.use(express.json());

const cors = require('cors');

require('dotenv').config();

const connect = require('./db_connect');
connect();
app.use(cors());



app.use('/user', require('./routes/user'));
app.use('/post', require('./routes/post'));
app.use('/comment', require('./routes/comment'));
app.use('/category', require('./routes/category'));
app.use('/api', require('./routes/user'));

const PORT = process.env.PORT;

app.get("/", (req, res) => res.send("Working"));


app.listen(PORT, (err) =>{
	err ? console.log(err) : console.log(`Server running on port ${PORT}`);
});