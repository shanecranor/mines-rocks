import { NextPage } from 'next';
import Home from './page-client';
export const metadata = {
  title: 'Upload courses to mines.rocks',
  description: 'Share data about courses that you have taken',
};
const Contribute: NextPage = () => {
  return <Home />;
};
export default Contribute;
