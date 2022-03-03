import requireAuth from "../../middleware/requireAuth";
import {
  Box,
  Button,
  Container,
  Heading,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Index() {
  return (
    <Container
      maxW={"container.xls"}
      bg={useColorModeValue("gray.50", "gray.800")}
      py={4}
    >
      <Heading mb={4}>Dashboard</Heading>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Heading size={"lg"}>Projects</Heading>
        <Link href={"/projects"}>
          <Button colorScheme={"blue"}>Go to projects &rarr;</Button>
        </Link>
      </Box>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
