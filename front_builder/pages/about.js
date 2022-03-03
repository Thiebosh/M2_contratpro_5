import { Container, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";

export default function About() {
  return (
    <Container maxW={"container.xl"} py={8}>
      <Heading>About</Heading>
      <Text mt={4}>
        This project is maintained by the{" "}
        <NextLink href={"#team"}>
          <Link color={"blue.500"}>SpecTry team</Link>
        </NextLink>
        .
      </Text>
    </Container>
  );
}
