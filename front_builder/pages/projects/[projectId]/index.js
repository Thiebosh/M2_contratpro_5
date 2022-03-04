import requireAuth from "../../../middleware/requireAuth";
import {
  Button,
  Container,
  Heading,
  Text,
  Link,
  Flex,
  FormLabel,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from "next/link.js";
import { useEffect } from "react";
import ProjectEditNavBar from "../../../components/navigation/ProjectEditNavBar";
import ProjectEditLayout from "../../../components/layout/ProjectEditLayout";

export default function ProjectDetails() {
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {}, []);

  return (
    <Container maxW={"container.xl"}>
      <Flex direction={"row"}>
        <NextLink href={"/projects"}>
          <Button mt={5} colorScheme="blue">
            Back
          </Button>
        </NextLink>
        <FormLabel>Project Name</FormLabel>
        <Flex direction={"column"}>
          <NextLink href={"/projects"}>
            <Button mt={5} colorScheme="blue">
              Save
            </Button>
          </NextLink>
          <NextLink href={"/projects"}>
            <Button mt={5} colorScheme="blue">
              Generate
            </Button>
          </NextLink>
        </Flex>
      </Flex>

      <Heading>Project details</Heading>
      <Text>Id: {projectId}</Text>
    </Container>
  );
}

export const getServerSideProps = requireAuth;

ProjectDetails.layout = false;
