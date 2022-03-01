import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";

import "../styles/globals.css";
import Layout from "../components/navigation/Layout";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(
    <ChakraProvider>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
