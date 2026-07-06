// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({
//   to,
//   subject,
//   html,
// }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: "Resume Builder <onboarding@resend.dev>",
//       to,
//       subject,
//       html,
//     });

//     if (error) {
//       throw new Error(error.message);
//     }

//     return data;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// console.log("Email is ==", process.env.EMAIL);
// console.log("Email Password is ==", process.env.EMAIL_PASSWORD);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Resume Builder" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.log(error);
    throw new Error("Email sending failed");
  }
};