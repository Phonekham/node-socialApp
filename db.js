const mongodb = require("mongodb");

const connectionString =
  "mongodb+srv://phone:99491232@cluster0-jcjyk.mongodb.net/node-social?retryWrites=true&w=majority";
mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(err, client) {
    module.exports = client.db();
    const app = require("./app");
    app.listen(3000, () => {
      console.log("DB Connected");
    });
  }
);
