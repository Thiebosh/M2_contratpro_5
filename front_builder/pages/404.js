import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import ButtonLink from "../components/basic/ButtonLink";

export default function NotFound() {
  return (
    <Flex height="100vh" justifyContent="center">
      <Flex direction="column" mt={10}>
        <Text color="gray.500">ERROR 404</Text>
        <Heading mt={0}>Page not found</Heading>
        <ButtonLink
          mt={4}
          href={"/"}
          rightIcon={<ArrowForwardIcon />}
          colorScheme="blue"
        >
          Go back Home
        </ButtonLink>
      </Flex>
    </Flex>
  );
}
