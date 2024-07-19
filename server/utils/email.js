import nodemailer from 'nodemailer';
import { formatNumberWithDot } from './format.js';

export const sendVerificationEmail = async (email, code) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: `Verify ${email}`,
      html: `<!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <div>
            <p>Verification code is only available in 5 minutes</p>
            <p>Your code is: ${code}</p>
          </div>
        </body>
      </html>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        reject({
          error: true,
          success: false,
        });
      } else {
        console.log('Verification email sent:', info.response);
        resolve({
          error: false,
          success: true,
        });
      }
    });
  });
};
export const resetPassword = async (email, link) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: 'Reset password',
      html: `<!DOCTYPE html>
      <html>
        <head> </head>
        <body>
          <center>
            <table
              style="
                width: 560px;
                margin: 0;
                padding: 0;
                font-family: Helvetica, Arial, sans-serif;
                border-collapse: collapse !important;
                height: 100% !important;
                background-color: #ffffff;
              "
              align="center"
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
              id="m_-8681643305988200227bodyTable"
            >
              <tbody>
                <tr>
                  <td
                    align="center"
                    valign="top"
                    id="m_-8681643305988200227bodyCell"
                    style="
                      margin: 0;
                      padding: 0;
                      font-family: Helvetica, Arial, sans-serif;
                      height: 100% !important;
                    "
                  >
                    <div
                      style="
                        background-color: #ffffff;
                        color: #202123;
                        padding: 27px 28px 0 25px;
                      "
                    >
                    </div>
                    <div
                      style="
                        background-color: #f5f5f5b3;
                        color: #353740;
                        margin: 20px 15px;
                        padding: 14px;
                        border-radius: 12px;
                        text-align: left;
                        line-height: 1.5;
                      "
                    >
                      <h2
                        style="
                          color: #202123;
                          font-size: 32px;
                          line-height: 40px;
                          margin: 0 0 20px;
                        "
                      >
                      Reset password. Password is only available in 5 minutes.
                      </h2>
                      
                      <p style="font-size: 16px; line-height: 24px">
                      Please click the button below to reset your password for the email ${email}.
                      </p>
          
                      <p style="margin: 24px 0 0; text-align: left">
                        <a
                          href="${link}"
                          style="
                            display: inline-block;
                            text-decoration: none;
                            background: #10a37f;
                            border-radius: 3px;
                            color: white;
                            font-family: Helvetica, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                            font-weight: 400;
                            padding: 12px 20px 11px;
                            margin: 0px;
                          "
                          target="_blank"
                          data-saferedirecturl="${link}"
                        >
                        Get password
                        </a>
                      </p>
                    </div>
                    <div
                      style="
                        text-align: left;
                        background: #ffffff;
                        color: #6e6e80;
                        padding: 0 20px 20px;
                        font-size: 13px;
                        line-height: 1.4;
                      "
                    >
                      <p style="margin: 0">
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </body>
      </html>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        reject({
          error: true,
          success: false,
        });
      } else {
        console.log('Verification email sent:', info.response);
        resolve({
          error: false,
          success: true,
        });
      }
    });
  });
};

export const replyEmail = async (email, content) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: `Reply to ${email}`,
      html: `<!DOCTYPE html>
      <html>
        <head></head>
        <body>
         ${content}
        </body>
      </html>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        reject({
          error: true,
          success: false,
        });
      } else {
        console.log('Verification email sent:', info.response);
        resolve({
          error: false,
          success: true,
        });
      }
    });
  });
};

export const sendNotificationWhenOrder = async (email, order, title) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.APP_EMAIL,
      to: email,
      subject: `${title}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Details</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }
        h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        .order-info {
            margin-bottom: 20px;
        }
        .order-info p {
            margin: 5px 0;
        }
        .order-details {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .order-details th, .order-details td {
            padding: 10px;
            border: 1px solid #ddd;
        }
        .order-details th {
            background-color: #8b5cf6;
            color: #fff;
        }
        .link-order {
            all: unset;
            text-decoration: none;
            margin: auto;
            width: max-content;
            padding: 12px 16px;
            background-color: #000;
            color: #fff !important;
            display: block;
            text-align: center;
        }
        .button-container {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Thank you for your order with LQ Camera. Below are the details of your order:</h2>
        <div class="order-info">
            <p><strong>Email: </strong>${email}</p>
            <p><strong>Address: </strong>${order?.address}</p>
            <p><strong>Phone: </strong>${order?.phone}</p>
            <p><strong>Message: </strong>${order?.message}</p>
            <p><strong>Payment method:</strong> <span style="text-transform: uppercase">${
              order?.paymentMethod
            }</span></p>
        </div>
        <table class="order-details">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Shipping Fee</th>
                    <th>Discount</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${order?.paymentInfo?.orderCode}</td>
                    <td>${formatNumberWithDot(order?.rateFromProvince)}</td>
                    <td>${formatNumberWithDot(order?.discount)}</td>
                    <td>${formatNumberWithDot(order?.originPrice)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right;"><strong>Total</strong></td>
                    <td><strong>${formatNumberWithDot(
                      order?.totalPrice
                    )}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="button-container">
            <a class="link-order" href="${
              process.env.CLIENT_URL
            }/dashboard/users/orders/${
        order?.paymentInfo?.orderCode
      }" target="_blank">View more</a>
        </div>
        <p>If you have any questions, please contact us at ${
          process.env.APP_EMAIL
        }</p>
    </div>
</body>
</html>
`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        reject({
          error: true,
          success: false,
        });
      } else {
        console.log('Verification email sent:', info.response);
        resolve({
          error: false,
          success: true,
        });
      }
    });
  });
};
