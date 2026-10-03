export const resetPasswordTemplate = (name, otp) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #e5e7eb; border-radius:10px;">
    
    <h2 style="color:#dc2626;">Resume Builder - Password Reset</h2>

    <p>Hi <strong style="text-transform: capitalize;">${name}</strong>,</p>

    <p>You requested to reset your password for <strong>Resume Builder</strong>.</p>

    <p>Please use the following OTP to proceed with password reset:</p>

    <div
      style="
        background:#dc2626;
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

    <p><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support immediately. Your account security is important to us.</p>

    <hr>

    <small style="color:gray;">
      © ${new Date().getFullYear()} Resume Builder
    </small>

  </div>
  `;
};