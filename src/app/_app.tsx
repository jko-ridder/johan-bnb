import Layout from '../components/Layout';
import '../styles/globals.css';

function myApp({ Component, pageProps }) {
  return (    
      <Layout>
        <Component {...pageProps} />
      </Layout>
  );
}


export default myApp;