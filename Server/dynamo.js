const AWS = require("aws-sdk");
const bcrypt = require("bcrypt");
require("dotenv").config();
const schedule = require("node-schedule");
const fs = require('fs');

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    sessionToken: process.env.AWS_SESSION_TOKEN,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const dynamodb = new AWS.DynamoDB();
const TABLE_NAME = 'user_data';

const snsClient = new AWS.SNS();
const cf = new AWS.CloudFormation();
const stackName = 'Wholeproject';


const getAllUser = async () => {
    const params = {
        TableName: TABLE_NAME,
    };
    const users = await dynamoClient.scan(params).promise();
    console.log(users);
    return users;
};

//First time registartion for user
const addUser = async (user) => {
    const email = user.email;
    const password = user.password;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const params = {
        TableName: TABLE_NAME,
        Key: {
            email: email,
        },
    };
    try {
        const existingUser = await dynamoClient.get(params).promise();
        if (existingUser.Item) {
            throw new Error("Email already registered");
        } else {
            const putParams = {
                TableName: TABLE_NAME,
                Item: {
                    password: hashedPassword,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    phone: user.phone,
                },
            };
            await dynamoClient.put(putParams).promise();

            cf.describeStacks({ StackName: stackName }, (err, data) => {
                if (err) {
                    console.error('Error getting stack information:', err);
                } else {
                    const stack = data.Stacks[0];

                    // Get the ARN of the SNS topic from the CloudFormation stack outputs
                    let snsTopicArn;
                    for (const output of stack.Outputs) {
                        if (output.OutputKey === 'MySNSTopicArn') {
                            snsTopicArn = output.OutputValue;
                            break;
                        }
                       
                    }
                    const email = user.email;
                    const subscribeParams = {
                        Protocol: 'email',
                        TopicArn: snsTopicArn,
                        Endpoint: email
                    };
                    snsClient.subscribe(subscribeParams, (err, data) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Subscribed email:', email);
                        }
                    });
                }
            });
            const savedUser = await dynamoClient.get(params).promise();

            return savedUser;
        }
    } catch (err) {
        if (err.code === "NetworkingError" || err.code === "UnknownEndpoint") {
            throw new Error("Something went wrong");
        } else {
            throw err;
        }
    }
};

//Login User
const getUserByEmail = async (email) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            email: email,
        },
    };
    try {
        const data = await dynamoClient.get(params).promise();
        return data.Item;
    } catch (err) {
        throw err;
    }
};

const deleteUser = async (id) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id,
        },
    };
    return await dynamoClient.delete(params).promise();
};

const triggerLambda = async () => {
    console.log("count down started!");
    const job = schedule.scheduleJob("11 01 * * *", function () {
        console.log("Running task at 8:45 PM every day");
        // Call your function here
        const lambda = new AWS.Lambda({ region: "us-east-1" });

        const functionName = "EmailSendingFunction";

        const payload = {

        };

        const params = {
            FunctionName: functionName,
            Payload: JSON.stringify(payload),
        };

        lambda.invoke(params, function (err, data) {
            if (err) {
                console.error(err);
            } else {
                console.log(data);
            }
        });
    });
};

module.exports = {
    dynamoClient,
    dynamodb,
    // getAllUser,
    // getUserById,
    // addOrUpdateUser,
    triggerLambda,
    addUser,
    deleteUser,
    getUserByEmail
};
