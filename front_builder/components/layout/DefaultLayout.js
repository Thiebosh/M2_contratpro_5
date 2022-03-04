import { Box, useColorModeValue } from "@chakra-ui/react";
import NavBar from "../navigation/NavBar";
import Header from "./Header";
import Footer from "./Footer";

export default function DefaultLayout({ children }) {
  return (
    <>
      <Header />
      <NavBar />
      <Box
        bg={useColorModeValue("gray.50", "gray.800")}
        minH={"calc(100vh - 120px)"}
      >
        {children}
      </Box>
      <Footer />
    </>
  );
}
