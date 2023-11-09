import styles from './navbar.module.scss';

const Navbar = () => {
  return (
    <div className={styles['nav-container']}>
      <nav className={styles.nav}>
        <a className={styles['site-logo']} href="/">
          mines.rocks
        </a>
        <div className={styles['nav-links']}>
          <a href="https://syllabuddies.pages.dev/">Syllabuddies</a>
          {/* <a>About</a> */}
          <a href="/contribute">Contribute</a>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
