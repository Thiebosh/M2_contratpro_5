import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Icon,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import dayjs from "dayjs";

import { AddIcon, DeleteIcon, EditIcon, SettingsIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import $ from "jquery";
import requireAuth from "../../middleware/requireAuth";
import ProjectCreateModal from "../../components/modals/ProjectCreateModal";
import ProjectRenameModal from "../../components/modals/ProjectRenameModal";
import { UserIcon } from "@heroicons/react/outline";

export default function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [renameProject, setRenameProject] = useState(0);
  const toast = useToast();

  function getProjectsByUser() {
    $.ajax({
      url: "http://localhost:8001/project/search_by_user",
      type: "POST",
      data: {
        id: user.id,
      },
      success: function (resp) {
        setProjects(resp.result);
      },
      error: function (error) {
        console.log(error);
      },
    });
  }

  useEffect(() => {
    getProjectsByUser();
  }, []);

  /* HANDLE FUNCTIONS */
  function deleteProject(projectID) {
    $.ajax({
      url: "http://localhost:8001/project/delete",
      type: "POST",
      data: {
        id: projectID,
      },
      success: function (resp) {
        getProjectsByUser();
        toast({
          title: "Project deleted",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      },
      error: function (error) {
        toast({
          title: "Delete failed",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log(error);
      },
    });
  }

  return (
    <>
      <Container
        maxW={"container.xls"}
        bg={useColorModeValue("gray.50", "gray.800")}
        py={8}
      >
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
            <Button
              leftIcon={<AddIcon />}
              colorScheme={"blue"}
              onClick={() => setOpenCreate(true)}
            >
              New project
            </Button>
          </Box>
        </Flex>

        <Box className="container">
          <Wrap direction="column">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Creation date</Th>
                  <Th>Last modified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {projects.map((project) => (
                  <Tr key={project.id}>
                    <Td>{project.name}</Td>
                    <Td>{dayjs(project.creation).format("D MMMM YYYY")}</Td>
                    <Td>{dayjs(project.last_specs).format("D MMMM YYYY")}</Td>
                    <Td>
                      <IconButton
                        aria-label="modifier"
                        mx={1}
                        icon={<EditIcon />}
                        onClick={() => setRenameProject(project.id)}
                      />
                      <Link href={`/projects/${project.id}/settings`}>
                        <IconButton
                          aria-label="settings"
                          mx={1}
                          icon={<Icon as={UserIcon} boxSize={5} />}
                        />
                      </Link>
                      <IconButton
                        aria-label="delete"
                        mx={1}
                        icon={<DeleteIcon />}
                        onClick={() => deleteProject(project.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Wrap>
        </Box>
      </Container>
      <ProjectCreateModal
        isOpen={openCreate}
        setIsOpen={setOpenCreate}
        user={user}
      />
      <ProjectRenameModal
        projectId={renameProject}
        setProjectId={setRenameProject}
      />
    </>
  );
}

export const getServerSideProps = requireAuth;
