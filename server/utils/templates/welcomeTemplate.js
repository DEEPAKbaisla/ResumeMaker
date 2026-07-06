export const welcomeTemplate = (name) => {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">

    <h2 style="color:#2563eb;">
      Welcome to Resume Builder 🎉
    </h2>

    <p>Hello <strong>${name}</strong>,</p>

    <p>Your email has been verified successfully.</p>

    <p>Your account is now ready.</p>

    <p>You can start creating professional resumes.</p>

    <br/>

    <p>Happy Coding ❤️</p>

  </div>
  `;
};