const app = require('./app');
require("dotenv").config(); // if you use .env
require('./db');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

