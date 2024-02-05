import { MongoClient } from "mongodb";

const uri = `mongodb+srv://test1:01LNHJnff8iEp7dS@cluster0.0aaafyp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

let conn;

try {
  conn = await client.connect();
} catch (error) {
  console.error(error);
}

export default conn.db("gasdetection");
