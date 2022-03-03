import requireAuth from "../../../middleware/requireAuth";
import { Container, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function ProjectDetails() {
  const router = useRouter();
  const { projectId } = router.query;

  return (
    <Container maxW={"container.xl"} py={8}>
      <Heading>Project details</Heading>
      <Text>Id: {projectId}</Text>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
