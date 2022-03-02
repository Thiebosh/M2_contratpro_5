import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  Select,
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

import { AddIcon, DeleteIcon, EditIcon, SettingsIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import $ from "jquery";
import requireAuth from "../../components/utils/requireAuth";

const idUser = "bentest";

export default function Projects() {
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
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {projects.map((project) => (
                <Tr key={project._id}>
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
                      //onClick={this.handleClick(console.log("ffff"))}
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

  function deleteProject(projectID) {
    $.ajax({
      url: "http://localhost:8001/project/delete",
      type: "POST",
      data: {
        id: projectID,
      },
      success: function (resp) {
        console.log(resp);
      },
      error: function () {
        console.log("failure");
      },
    });
  }
}

export const getServerSideProps = requireAuth;
