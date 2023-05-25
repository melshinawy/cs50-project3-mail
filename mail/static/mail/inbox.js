document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  submitBtn = document.querySelector('input[type="submit"]');
  submitBtn.value = 'Send';

  recipients = document.querySelector('#compose-recipients');
  recipients.placeholder = 'Separate multiple recipients with commas'

  submitBtn.onclick = send;
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
  emailsView = document.querySelector('#emails-view')
  emailsView.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  let table = document.createElement('table');
  let tr = document.createElement('tr');
  let thead = document.createElement('th');
  

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails[0])
    

    emailsView.append(emails[0].sender)
  });
}

function send(event) {
  event.preventDefault()

  // Create objects for recipients, subject and email body
  subject = document.querySelector('#compose-subject');
  body = document.querySelector('#compose-body');

  // Use the created objects' values to post to emails URL
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
}