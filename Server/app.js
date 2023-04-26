const express = require("express");
const https = require("https");

const multer = require('multer');
const upload = multer();
const AWS = require('aws-sdk');

AWS.config.update(
  {
      region : process.env.AWS_DEFAULT_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY_ID,
      sessionToken: process.env.AWS_SESSION_TOKEN
  }
);

const app = express();
const {
  getAllUser,
  getUserById,
  addOrUpdateUser,
  deleteUser,
  addUser,
  getUserByEmail,
  triggerLambda,
} = require("./dynamo");

const {
  createTableForTodoList,
  addToDo,
  getAllTodos,
  deleteTodo,
  updateToDo,
} = require("./todolistDynamo");
const bcrypt = require("bcrypt");

app.use(express.json());

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/users", async (req, res) => {
  try {
    const users = await getAllUser();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});
// TODO: Get To Do list by To Do list name or something else
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await getUserById(id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

//TODO : Add To do list
app.post("/users", async (req, res) => {
  const user = req.body;
  try {
    const newUser = await addOrUpdateUser(user);
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

//registartion
app.post("/registration", async (req, res) => {
  const user = req.body;
  try {
    const newUser = await addUser(user);
    console.log(newUser);
    res.status(200).send(newUser);
  } catch (err) {
    console.error(err);
    if (err.message === "Email already registered") {
      res.status(400).json({ error: "Email already registered" });
    } else {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

//Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email or password is wrong" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email or password is wrong" });
    }
    res.send({
      userDetails: user,
    });
   // res.json({ message: "Successfully logged in!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post('/extractText', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new Error('No image file found');
    }
    const textract = new AWS.Textract();
    const detectParams = {
      Document: {
        Bytes: req.file.buffer
      }
    };
    const data = await textract.detectDocumentText(detectParams).promise();
    const lines = data.Blocks.filter(block => block.BlockType === 'LINE').map(block => block.Text).join('\n');
    console.log(lines);
    res.status(200).send(lines);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || 'Internal Server Error');
  }
});


// TODO : Update One perticular To DO list
app.put("/users/:id", async (req, res) => {
  const user = req.body;
  const { id } = req.params;
  user.id = id;
  try {
    const newUser = await addOrUpdateUser(user);
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

// TODO : Delete To DO
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    res.json(await deleteUser(id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

app.post("/todo/add", async (req, res) => {
  const response = await addToDo(
    req.body.user_id,
    req.body.task_title,
    req.body.task_description,
    req.body.task_due_date,
    req.body.task_reminder_date
  );
  if (response) {
    return res.status(200).json({ message: "todo added!" });
  } else {
    return res.status(500).json({ message: "error adding todo" });
  }
});

app.delete("/todo/delete/:task_id/:user_id", async (req, res) => {
  const result = await deleteTodo(req.params.task_id, req.params.user_id);
  if (result) {
    res.send({ message: "Successfully deleted!" });
  } else {
    res.status(500).send({ message: "Error in deleting todo!" });
  }
});

app.put("/todo/update/:task_id", async (req, res) => {
  const result = await updateToDo(
    req.body.user_id,
    req.params.task_id,
    req.body.task_description,
    req.body.task_due_date,
    req.body.task_reminder_date,
    req.body.is_completed,
    req.body.task_title,
  );
  if (result) {
    res.status(200).send({ message: "Successfully updated!" });
  } else {
    res.status(500).send({ message: "Error in updating todo!" });
  }
});

app.get("/getAllTodos/:user_id", async (req, res) => {
    const result = await getAllTodos(req.params.user_id).then((data) => {
        if (data) {  
              const result = data.Items.map((ele) => {
              return { 
                user_id: ele.user_id.S,
                task_title : ele.task_title.S,
                task_id: ele.task_id.S,
                task_due_date: ele.task_due_date.S,
                task_description: ele.task_description.S,
                is_completed: ele.is_completed.S
              }
            })
            return result;
        }  
    });

    if (result) {
        return res.status(200).json( result );
    } else {
        return res.status(500).json({ message: "Error getting Todos" });
    }
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log(`listening on port ${port}`);
  createTableForTodoList();

  triggerLambda();
  
});
