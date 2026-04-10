

function generateEmailTemplate({
  title = "Notification",
  message = "",
  buttonText = "",
  buttonUrl = "#",
  logoUrl = "https://res.cloudinary.com/demhu4uaf/image/upload/v1775635020/snapcv_cmw1qe.jpg"
}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  </head>

  <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
  <tr>
  <td align="center">

  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr>
  <td align="center" style="background:linear-gradient(90deg,#2184E5,#8036D7);padding:30px;">
  
  <img src="${logoUrl}" width="120" alt="logo" style="display:block;margin-bottom:10px;" />
  
  </td>
  </tr>

  <!-- CONTENT -->
  <tr>
  <td style="padding:40px 30px;text-align:center;color:#333;">

  <h2 style="margin-top:0;color:#111;">${title}</h2>

  <p style="font-size:15px;line-height:1.6;color:#555;">
  ${message}
  </p>

  ${
    buttonText
      ? `
  <a href="${buttonUrl}"
     style="
     display:inline-block;
     margin-top:20px;
     padding:14px 28px;
     background:#2184E5;
     color:#fff;
     text-decoration:none;
     border-radius:6px;
     font-weight:bold;">
     ${buttonText}
  </a>
  `
      : ""
  }

  </td>
  </tr>

  <!-- FOOTER -->
  <tr>
  <td style="background:#f7f7f7;padding:20px;text-align:center;font-size:13px;color:#777;">
  
  If you didn't request this email you can safely ignore it.
  <br><br>
  © ${new Date().getFullYear()} Your Company
  
  </td>
  </tr>

  </table>

  </td>
  </tr>
  </table>

  </body>
  </html>
  `;
}

export default generateEmailTemplate;