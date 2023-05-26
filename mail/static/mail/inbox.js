document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Change the text to submit button to "Send"
  document.querySelector('input[type="submit"]').value = 'Send';
  document.querySelector('input[type="submit"]').onclick = send;

  // Add a placeholder in the recipients field to instruct the user on how to send to multiple recipients
  document.querySelector('#compose-recipients').placeholder = 'Separate multiple recipients with commas';

  // Set an action to the send button when clicked
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // div container emails are enclosed
  const mailboxTable = document.createElement('table');
  mailboxTable.className = "table table-sm";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch mailbox data
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Email items to view in mailbox depending on the mailbox type
    let emailItems = [];

    if (mailbox === 'sent') {
      emailItems = ['recipients', 'subject', 'timestamp']
    } else {
      emailItems = ['sender', 'subject', 'timestamp'];
    }

    // Create a row for each email containing the information in emailItems
    emails.forEach(email => {
      let row = mailboxTable.insertRow();
      row.style.cursor = 'pointer';
      row.addEventListener('mouseover', () => {
        row.style.color = 'blue';
        row.style.textDecoration = 'underline'
      })

      row.addEventListener('mouseout', () => {
        row.style.color = 'black';
        row.style.textDecoration = 'none'
      })

      row.addEventListener('click', () => {
        document.querySelector('#emails-view').innerHTML = `
          <div>
            <p><span style="font-weight: bold;">From: </span>${email.sender}<br>
            <span style="font-weight: bold;">To: </span>${email.recipients}<br>
            <span style="font-weight: bold;">Subject: </span>${email.subject}<br>
            <span style="font-weight: bold;">Timestamp: </span>${email.timestamp}<br>
            <a href="#" class="btn btn-primary">Reply</a></p>
        </div>
        `
      });

      // Have read emails with a grey background and unread emails in white background
      if (email.read) {
        row.className = 'table-secondary';
      }
      
      // Poulate row cells with email information
      for (let item of emailItems) {
        let cell = row.insertCell();
        cell.innerHTML = email[item];
        if (item === 'sender' || item === 'recipients') {
          cell.style.fontWeight = 'bold'
        }
      }
      
      // Append table to div with id #emails-view
      document.querySelector('#emails-view').appendChild(mailboxTable);
      })
  })
}


// Function for when the Send button is clicked
function send(event) {
  event.preventDefault()
  // Create objects for recipients, subject and email body
  subject = document.querySelector('#compose-subject');
  body = document.querySelector('#compose-body');
  recipients = document.querySelector('#compose-recipients')

  // Use the created objects' values to post to emails URL
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value,
    })
  })
  .then(response => response.json())
  .then(result => {
    // TODO: Redirect the user to an error page if the email is not sent
    if (result.message === 'Email sent successfully.') {
      load_mailbox('sent');
    }
    console.log(result);
  });
}

// Function for when an emai is clicked

function viewEmail(email) {
  document.querySelector('#emails-view').innerHTML = '';
  console.log(email);

}