import { transporter } from "./transporter.js";

export const sendMail = async ({
  to,
  subject,
  html,
}) => {

  const info = await transporter.sendMail({

    from: process.env.email,

    to,

    subject,

    html,

  });

  return info;
};