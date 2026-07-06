export const otpTemplate = (name, otp) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #e5e7eb; border-radius:10px;">
    
    <h2 style="color:#2563eb;">Resume Builder</h2>

    <p>Hi <strong style="text-transform: capitalize;">${name}</strong>,</p>

    <p>Thank you for registering with <strong>Resume Builder</strong>.</p>

    <p>Please use the following OTP to verify your email address:</p>

    <div
      style="
        background:#2563eb;
        color:white;
        display:inline-block;
        padding:15px 25px;
        font-size:28px;
        letter-spacing:6px;
        border-radius:8px;
        font-weight:bold;
        margin:20px 0;
      "
    >
      ${otp}
    </div>

    <p>This OTP is valid for <strong>5 minutes</strong>.</p>

    <p>If you didn't request this account, you can safely ignore this email.</p>

    <hr>

    <small style="color:gray;">
      © ${new Date().getFullYear()} Resume Builder
    </small>

  </div>
  `;
};
