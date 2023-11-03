const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");


const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:"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"
          
      },
    })
  );


  module.exports = transporter;