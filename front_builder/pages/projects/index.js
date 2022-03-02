import {
  Avatar,
  Box,
  Center,
  Container,
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

import { EditIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import $ from "jquery";

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
    <Container maxW="container.xl">
      <Box className="header" m={5}>
        <Wrap>
          <WrapItem>
            <Avatar size="xl" src="https://bit.ly/code-beast" />
          </WrapItem>
          <WrapItem>
            <Center w="200px" h="100px">
              <Text fontSize="xl">Projets en cours...</Text>
            </Center>
          </WrapItem>
        </Wrap>
      </Box>

      <Box className="container">
        <Wrap direction="column">
          <Table variant="simple">
            <TableCaption>Liste des projets en cours</TableCaption>
            <div className="numberProjects"></div>
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
                <Tr>
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
