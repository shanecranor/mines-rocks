/* eslint-disable @next/next/no-img-element */
import Navbar from '@/components/navbar/navbar';
import styles from './instructions.module.scss';

const Instructions = () => {
  return (
    <div className={styles['instructions']}>
      <h1>Uploading Canvas Data Instructions</h1>
      <p>
        To upload your Canvas data, you will need to generate a new API key from
        your Mines Canvas account. Please follow the steps below:
      </p>
      <ol>
        <li>
          Go to the Mines Canvas site at{' '}
          <a
            href="https://elearning.mines.edu"
            target="_blank"
            rel="noopener noreferrer"
          >
            elearning.mines.edu
          </a>
          .
        </li>
        <li>Click on your profile icon in the top left corner.</li>
        <li>
          Select &ldquo;Settings&rdquo; from the list of options.
          <br></br>
          <img
            width="300px"
            src="settings.png"
            alt="screenshot of panel that opens up when you click on your profile picture"
          />
        </li>
        <li>
          Scroll down to the &ldquo;Approved Integrations&rdquo; section and
          scroll to the last app
        </li>
        <li>
          Click the button labeled &ldquo;New Access Token&rdquo;. <br></br>
          <img
            src="new_access_token.png"
            alt="the button that creates a new access token"
          />
        </li>
        <li>
          Provide a purpose for the token (you can type mines.rocks, or whatever
          you want. It doesn&apos;t effect the uploading). To be safe, you
          should also set the expiration date to some time in the near future, a
          few days or a week from now is fine. <br></br>Uploading is a one time
          process, mines.rocks does not store your API key to use later so you
          will have to upload again if you want to add more courses.
          <br></br>
          <img
            width="360px"
            src="new_access_token_popup.png"
            alt="the ui that pops up when you click the new access token button"
          />
        </li>
        <li>
          Click the &ldquo;Generate Token&rdquo; button to create your new API
          key.
        </li>
        <li>
          Paste the API key into the textbox below and click &ldquo;Load
          Courses!&rdquo;
        </li>
      </ol>
    </div>
  );
};

export default Instructions;
