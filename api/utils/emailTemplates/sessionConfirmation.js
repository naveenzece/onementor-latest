
const generateSessionConfirmationEmail = ({
    studentName,
    mentorName,
    date,
    timeSlots,
    meetLink,
    amount
  }) => {
    return {
      subject: `Session Confirmed: ${studentName} & ${mentorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Session Confirmed!</h2>
          </div>
          <div style="padding: 24px;">
            <p>Hi,</p>
            <p>Your monitoring session is successfully booked!</p>
            
            <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Student:</strong> ${studentName}</p>
              <p style="margin: 8px 0;"><strong>Mentor:</strong> ${mentorName}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 8px 0;"><strong>Time Slots:</strong></p>
              <ul style="margin: 8px 0; padding-left: 20px;">
                ${timeSlots.map(slot => `<li>${slot}</li>`).join('')}
              </ul>
              <p style="margin: 8px 0;"><strong>Total Amount:</strong> ₹${amount}</p>
            </div>
  
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meetLink}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Join Google Meet
              </a>
              <p style="margin-top: 12px; font-size: 14px; color: #666;">
                 Or copy link: <a href="${meetLink}" style="color: #2563EB;">${meetLink}</a>
              </p>
            </div>
  
            <p>Please make sure to join the meeting on time.</p>
            <p>Best regards,<br/>The OneMentor Team</p>
          </div>
          <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6B7280;">
            &copy; ${new Date().getFullYear()} OneMentor. All rights reserved.
          </div>
        </div>
      `
    };
  };
  
  module.exports = { generateSessionConfirmationEmail };
  
