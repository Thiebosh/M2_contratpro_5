import requireAuth from "../../middleware/requireAuth";
import {
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import $ from "jquery";
import axios from "axios";

export default function Dashboard({ user }) {
  const [projects, setProjects] = useState([]);

  const [account, setAccount] = useState();

  function getAccount() {
    axios
      .get("/api/accounts/" + user.id)
      .then((res) => setAccount(res.data))
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    $.ajax({
      url: "http://localhost:8001/project/search_by_user",
      type: "POST",
      data: {
        id: user.id,
      },
      success: function (res) {
        setProjects(res.result);
      },
      error: function (error) {
        console.log(error);
      },
    });
    getAccount();
  }, []);

  return (
    <Container
      maxW={"container.xls"}
      bg={useColorModeValue("gray.50", "gray.800")}
      py={4}
    >
      <Heading mb={6}>Dashboard</Heading>
      <Grid
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(6, 1fr)"
        gap={4}
      >
        <GridItem
          colSpan={3}
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Heading size={"lg"} mb={2}>
            Projects
          </Heading>
          <Text mb={4}>Number of projects : {projects.length}</Text>
          <Link href={"/projects"}>
            <Button colorScheme={"blue"}>All projects &rarr;</Button>
          </Link>
        </GridItem>
        <GridItem
          colSpan={3}
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Heading size={"lg"} mb={2}>
            Account
          </Heading>
          <Text mb={4}>
            Username :{" "}
            <Text as={"i"} fontStyle={"italic"}>
              {account && account.name}
            </Text>
          </Text>
          <Link href={"/projects"}>
            <Button colorScheme={"blue"}>My account &rarr;</Button>
          </Link>
        </GridItem>
      </Grid>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
