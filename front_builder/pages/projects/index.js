import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import Link from "next/link";
import $ from "jquery";
import requireAuth from "../../components/utils/requireAuth";

const idUser = "61dda39cbac26d9cb4cd6d7e";

export default function Projets() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const dataProjects = {
      id: idUser,
    };
    $.ajax({
      url: "http://localhost:8001/project/search_by_user",
      type: "POST",
      data: dataProjects,
      success: function (resp) {
        setProjects(resp.result);
        console.log(resp);
      },
      error: function () {
        console.log("failure");
      },
    });
  }, []);

  return (
    <Container maxW={"container.xl"} py={8}>
      <Flex m={5} justifyContent={"space-between"}>
        <Wrap>
          <WrapItem>
            <Avatar size="xl" src="https://bit.ly/code-beast" />
          </WrapItem>
          <WrapItem>
            <Center w="200px" h="100px">
              <Heading>Projets</Heading>
            </Center>
          </WrapItem>
        </Wrap>
        <Box>
          <Link href="/projects/create">
            <Button leftIcon={<AddIcon />} colorScheme={"blue"}>
              New project
            </Button>
          </Link>
        </Box>
      </Flex>

      <Box className="container">
        <Wrap direction="column">
          <Table variant="simple">
            <TableCaption>Liste des projets en cours</TableCaption>
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Date de création</Th>
                <Th>Dernière modification au</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {projects.map((project) => (
                <Tr key={project._id}>
                  <Td>{project.name}</Td>
                  <Td>{dayjs(project.creation).format("D MMMM YYYY")}</Td>
                  <Td>{dayjs(project.last_specs).format("D MMMM YYYY")}</Td>
                  <Td>
                    <IconButton aria-label="modifier" icon={<EditIcon />} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Wrap>
      </Box>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
