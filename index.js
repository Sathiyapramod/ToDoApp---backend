import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();
import { MongoClient, ObjectId } from "mongodb";
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); //dialing operation
await client.connect(); //This is a calling operation
//since calling will take some time, await needs to be prefixed

app.get("/", (request, response) => {
  response.send({ message: "To Do", version:1.0 ,comments:"Perform required CRUD Operations for the tasks module " });
});

//READ operations in todo lists
app.get("/lists", async (request, response) => {
  const getToDoListsfromDB = await client
    .db("todo")
    .collection("lists")
    .find({})
    .toArray();
  getToDoListsfromDB
    ? response.send(getToDoListsfromDB)
    : response.status(401).send({ message: "Failed to Load the lists" });
});
//CREATE new todo list for the app
app.post("/lists", async (req, res) => {
  const { toDo } = req.body;
  const newTask = await client.db("todo").collection("lists").insertOne({
    task: toDo,
  });
  newTask.acknowledged == true
    ? res.send({ message: "New Tasks Added Successfully" })
    : res.status(401).send({ message: "Failed to add new tasks" });
});

//UPDATE existing toDo task in the app
app.put("/lists/:id", async (req, res) => {
  const { id } = req.params;
  const { toDo } = req.body;
  if (toDo == null || toDo == "")
    response.status(401).send({ message: "Content cannot be null !!" });
  else {
    const checkIdinsideDb = await client
      .db("todo")
      .collection("lists")
      .findOne({ _id: new ObjectId(id) });

    if (!checkIdinsideDb)
      res.status(401).send({ message: "Invalid Id number" });
    else {
      const updateTaskinDB = await client
        .db("todo")
        .collection("lists")
        .updateOne({ _id: new ObjectId(id) }, { $set: { task: toDo } });
      console.log(updateTaskinDB);
      updateTaskinDB.modifiedCount == 1
        ? res.send({ message: "Task updated successfully" })
        : res.status(401).send({ message: "failed to update task" });
    }
  }
});


//DELETE task from the to do app
app.delete("/lists/:id", async(req,res)=>{
    const { id } = req.params;
    const checkIdinsideDb = await client.db("todo").collection("lists").findOne({_id: new ObjectId(id)});
    if(!checkIdinsideDb)    
        res.status(401),send({message:"Invalid ID Number"});
    else {
        const deleteTaskfromDB = await client.db("todo").collection("lists").deleteOne({_id: new ObjectId(id)});
        deleteTaskfromDB ? res.send({message:"Task Deleted Successfully !!!"}) : res.status(401).send({message:"Failed to delete task !!"})
    }
})

app.listen(PORT, () =>
  console.log(`The Server is running on the port : ${PORT} 😉`)
);
