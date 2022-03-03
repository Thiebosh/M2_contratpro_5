import requireAuth from "../../components/utils/requireAuth";
import { Button, Container, Heading, Link } from "@chakra-ui/react";

export default function Index() {
  return (
    <Container maxW={"container.xl"} py={8}>
      <Heading>Dashboard</Heading>
      <hr my={4} />
      <Heading size={"md"}>Projects</Heading>
      <Link href={"/projects"}>
        <Button>See all projects &rarr;</Button>
      </Link>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
