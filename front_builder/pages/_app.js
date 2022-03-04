import { ChakraProvider } from "@chakra-ui/react";

import "../styles/globals.css";
import DefaultLayout from "../components/layout/DefaultLayout";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const Layout =
    Component.layout === undefined
      ? DefaultLayout
      : Component.layout
      ? Component.layout
      : ({ children }) => children;

  return (
    <ChakraProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
