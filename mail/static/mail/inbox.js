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

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email=null) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  if (email.subject === undefined) {
    to = '';
    subject = '';
    body = '';

  } else {
    to = email.sender;
    subject = email.subject.slice(0,3) === 'Re:' ? email.subject : `Re: ${email.subject}`;
    body = `
    On ${email.timestamp} ${email.sender} wrote:
    "${email.body}"
    `    
  }

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = to;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
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

      // Change mouse cursor and text format when hovering over an email
      row.style.cursor = 'pointer';
      row.addEventListener('mouseover', () => {
        row.style.color = 'blue';
        row.style.textDecoration = 'underline'
      })

      // Change back text format when mouse is not over an email
      row.addEventListener('mouseout', () => {
        row.style.color = 'black';
        row.style.textDecoration = 'none'
      })

      // When an email is clicked toggle viewEmail view
      row.addEventListener('click', function () {
        viewEmail(email, mailbox);
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
function send() {
  // event.preventDefault()
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
    console.log(result)
    // Load the sent mailbox if the email is sent successfully, else show an error message
    if (result.message === undefined) {
      document.querySelector('#emails-view').innerHTML = `
      <h1>Error:</h1>
      <p>Did not send email. ${result.error}</p>
      `
      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
    } else {
      load_mailbox('sent');
             
    }
  }).catch(error => {
    
  });
}

// Function for when an email is clicked

function viewEmail(email, mailbox) {

  // Mark email as read
  if (!email.read){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })  
  }

  // Generate the Archive button text based on whether or not the email is marked as archived
  const archiveText = email.archived ? 'Move to inbox' : 'Archive'

  // Create a view for email message
  document.querySelector('#emails-view').innerHTML = `
    <div style="border-bottom: solid lightgrey 1px; margin-bottom: 10px; padding-bottom: 10px;">
      <p><span style="font-weight: bold;">From: </span>${email.sender}<br>
      <span style="font-weight: bold;">To: </span>${email.recipients}<br>
      <span style="font-weight: bold;">Subject: </span>${email.subject}<br>
      <span style="font-weight: bold;">Timestamp: </span>${email.timestamp}<br>
      </p>
      <button id="reply" class="btn btn-sm btn-outline-primary">Reply</button>
      <button id="archive" class="btn btn-sm btn-outline-primary">${archiveText}</button>
    </div>
  <div>${email.body}</div>
  `;

  // Action for when the Reply button is clicked
  document.querySelector('#reply').onclick = function () {
    compose_email(email);
  }

  if (mailbox === 'sent') {
    document.querySelector('#archive').style.visibility = 'hidden';
  }
  
  // Action for when the archive button is clicked
  document.querySelector('#archive').onclick = function () {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: !email.archived
      })
    })
    load_mailbox('archive')
  }
}