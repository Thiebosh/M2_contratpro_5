import { ChakraProvider } from "@chakra-ui/react";

import "../styles/globals.css";
import Layout from "../components/layout/Layout";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(
    <ChakraProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
