const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: 'us-east-1' }); 
const https = require('https');

const getRandomQuote = () => {
  return new Promise((resolve, reject) => {
    https.get('https://type.fit/api/quotes', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const quotes = JSON.parse(data);
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        resolve(randomQuote);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

exports.handler = async (event, context) => {
  const topicArn = 'arn:aws:sns:us-east-1:843750665651:SendDeadlineEmail';
  const currentDate = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    const formattedDate = currentDate.toLocaleDateString('en-US', options)

  try {
    const randomQuote = await getRandomQuote();
    const linkToTheLoginOrDashboard = "Link will be here"

    const message = `${randomQuote.text} Please check your all pending task to keep all the work up to date: ${linkToTheLoginOrDashboard}`;
    
    const params = {
      Message: message,
      Subject: formattedDate,
      TopicArn: topicArn,
      MessageStructure: 'text'
    };

    const response = await sns.publish(params).promise();
    console.log(response);

    return {
      statusCode: 200,
      body: 'All messages sent successfully ' + formattedDate
    };
    
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Error sending messages'
    };
  }
};