const express = require('express');
const database = require('./services/database');

const app = express();
app.use(express.json());

app.use(require('./routes/categoryRoute'));
app.use(require('./routes/productRoute'));

app.listen(3000, () => {
    console.log(process.env.PGUSER);
    console.log("Server started on port 3000");
})

