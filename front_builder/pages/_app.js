import '../styles/globals.css'
import { SessionProvider } from "next-auth/react"
import {ChakraProvider} from "@chakra-ui/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => page)

  return getLayout(
    <ChakraProvider>
      <SessionProvider session={session}>
        <Component {...pageProps}/>
      </SessionProvider>
    </ChakraProvider>
  )
}

export default MyApp
