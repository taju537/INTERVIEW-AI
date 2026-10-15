require("dotenv").config()
const app = require("./src/app");
const connenctToDB = require("./src/config/database");

connenctToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on port no ${PORT}`);
});

