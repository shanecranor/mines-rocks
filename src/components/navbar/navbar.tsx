import styles from "./navbar.module.scss";

const Navbar = () => {
  return (
    <div className={styles["nav-container"]}>
      <nav className={styles.nav}>
        <div className={styles["site-logo"]}>mines.rocks</div>
        <div className={styles["nav-links"]}>
          <a href="https://syllabuddies.pages.dev/">Syllabuddies</a>
          {/* <a>About</a> */}
          <a>Contribute</a>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
