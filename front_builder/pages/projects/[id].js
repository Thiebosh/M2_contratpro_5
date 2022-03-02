import requireAuth from "../../components/utils/requireAuth";
import { Container, Heading } from "@chakra-ui/react";

export default function PojectDetails() {
  return (
    <Container maxW={"container.xl"}>
      <Heading>Project details</Heading>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
