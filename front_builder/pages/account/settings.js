import requireAuth from "../../middleware/requireAuth";
import { Container, Heading } from "@chakra-ui/react";

export default function Settings() {
  return (
    <Container maxW={"container.xl"} py={8}>
      <Heading>Settings</Heading>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
