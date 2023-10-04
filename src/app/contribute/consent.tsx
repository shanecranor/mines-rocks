import Navbar from "@/components/navbar/navbar";
import styles from "./consent.module.scss";

const ConsentForm = ({ onSubmit }: { onSubmit: () => void }) => {
  return (
    <>
      <Navbar />
      <div className={styles["consent-form"]}>
        <h1>Contributing Canvas Data</h1>
        <p>
          If you are still interested in contributing after reading through this
          page, you will be asked to generate and upload a temporary Canvas API
          key. Please read through this page carefully before proceeding.
        </p>

        <h2>What is a Canvas API key? </h2>
        <p>
          A Canvas API key is a password that can authenticate data requests to
          Canvas servers. This is not the same as your Canvas password, but
          allows API requests that can do anything that someone with access to
          your canvas password can do.
        </p>

        <h2>What Data Does Mines.Rocks Access?</h2>
        <p>This project will access the following data</p>
        <ul>
          <li>
            Courses: the list of courses that you have taken and agree to
            upload. Mines.rocks does not store who uploads which courses. You
            can opt out of uploading any courses that you do not want to share.
          </li>
          <li>
            Assignments & assignment Categories
            <ul>
              <li>
                Assignment Name, description, creation / due dates, and score
                statistics.
              </li>
              <li>
                Score statistics do <strong>not</strong> contain your individual
                grade data
              </li>
            </ul>
          </li>
        </ul>
        <p>
          <br />
          This site does <strong>NOT</strong> store or display any individual
          grade data. The site also does not store or access any assignment
          submissions. All data uploads are anonymous.
        </p>
        <h2>What is mines.rocks?</h2>
        <p>
          mines.rocks is an open source tool that anyone can use to look at
          historical course data. You can check out the source code, open an
          issue, or submit a PR here:{" "}
          <a href="https://github.com/shanecranor/canvas-api-project">
            mines.rocks on github
          </a>
          <br /> <br />
          Please note that mines.rocks is a student project and is not
          affiliated with, endorsed, or sponsored by the Colorado School of
          Mines.
        </p>
        <h2>Your Consent</h2>
        <p>
          By proceeding, you acknowledge that you understand the data that will
          be collected and stored by mines.rocks, the purpose of this data
          access, and the risks involved with sharing your API key.
        </p>
        <form
          action=""
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <label className={styles["consent-checkbox"]}>
            <input type="checkbox" name="consent" required /> I understand and
            agree
          </label>
          <button type="submit">Proceed</button>
        </form>
      </div>
    </>
  );
};

export default ConsentForm;
