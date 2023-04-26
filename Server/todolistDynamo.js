const { dynamodb } = require("./dynamo");
const uuid = require("uuid");
const { dynamoClient } = require("./dynamo");
const TABLE_NAME = "todo_list_records1";

const createTableForTodoList = () => {
  var params = {
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: "user_id", KeyType: "HASH" }, // Partition key
      { AttributeName: "task_id", KeyType: "RANGE" }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: "user_id", AttributeType: "S" },
      { AttributeName: "task_id", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  dynamodb.createTable(params, function (err, data) {
    if (err) {
      if (err.code === "ResourceInUseException") {
        console.log(`Table ${TABLE_NAME} already exists!`);
      } else {
        console.log(JSON.stringify(err));
      }
    } else {
      console.log(
        "Created table. Table description JSON:",
        JSON.stringify(data, null, 2)
      );
    }
  });
};

const addToDo = (userId,task_title, taskDescription, taskDueDate, task_reminder_date) => {
  const taskId = uuid.v4();

  const params = {
    TableName: TABLE_NAME,
    Item: {
      user_id: { S: userId },
      task_id: { S: taskId },
      task_title:{S: task_title},
      task_description: { S: taskDescription },
      task_reminder_date: { S: task_reminder_date },
      task_due_date: { S: taskDueDate },
      is_completed: { S: "pending" },
    },
  };
  return dynamodb.putItem(params).promise();
};

const getAllTodos = (userId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "user_id = :uid",
    ExpressionAttributeValues: {
      ":uid": { S: userId },
    },
  };

  return dynamodb.query(params).promise();
};

const deleteTodo = (taskId, user_id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { user_id: { S: user_id }, task_id: { S : taskId} },
  };
  return dynamodb.deleteItem(params).promise();
};

const updateToDo = (user_id, task_id, task_description, task_due_date, task_reminder_date, is_completed,task_title) => {
    const params = {
        TableName: TABLE_NAME,
        Key: { user_id: { S: user_id }, task_id: { S : task_id} },
        UpdateExpression: 'set task_description = :desc, task_due_date = :due_date, task_reminder_date = :reminder_date, is_completed = :completed, task_title = :title',
        ExpressionAttributeValues: {
          ':desc': { S: task_description },
          ':due_date': { S: task_due_date },
          ':reminder_date': { S: task_reminder_date },
          ':completed': { S : is_completed},
          ':title' : { S : task_title }
        },
        ReturnValues: 'UPDATED_NEW'
      };
      return dynamodb.updateItem(params).promise();
}



module.exports = {
  createTableForTodoList: createTableForTodoList,
  addToDo: addToDo,
  getAllTodos: getAllTodos,
  deleteTodo: deleteTodo,
  updateToDo: updateToDo
};
