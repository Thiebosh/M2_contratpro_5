import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import ProjectEditNavBar from "../navigation/ProjectEditNavBar";
import { Head } from "next/document";

export default function ProjectEditLayout({ children }) {
  return (
    <>
      <Head>
        <title>Edit Project</title>
      </Head>
      <ProjectEditNavBar />
      <Box
        bg={useColorModeValue("gray.50", "gray.800")}
        minH={"calc(100vh - 120px)"}
      >
        {children}
      </Box>
    </>
  );
}
