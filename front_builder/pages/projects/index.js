import {
  Avatar,
  Box,
  Center,
  Container,
  IconButton,
  Link,
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

import { DeleteIcon, EditIcon, SettingsIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
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
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Date de création</Th>
                <Th>Dernière modification au</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {projects.map((project) => (
                <Tr>
                  <Td>{project.name}</Td>
                  <Td>{dayjs(project.creation).format("D MMMM YYYY")}</Td>
                  <Td>{dayjs(project.last_specs).format("D MMMM YYYY")}</Td>
                  <Td>
                    <Link href="/dashboard">
                      <IconButton
                        aria-label="modifier"
                        mx={1}
                        icon={<EditIcon />}
                      />
                    </Link>
                    <IconButton
                      aria-label="settings"
                      mx={1}
                      icon={<SettingsIcon />}
                    />
                    <IconButton
                      aria-label="delete"
                      mx={1}
                      icon={<DeleteIcon />}
                    />
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
