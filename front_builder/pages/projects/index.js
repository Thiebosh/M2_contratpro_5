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

import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import Link from "next/link";
import $ from "jquery";
import requireAuth from "../../middleware/requireAuth";
import { UserIcon } from "@heroicons/react/outline";
import ConfirmDeleteDialog from "../../components/dialogs/ConfirmDeleteDialog";
import NameModal from "../../components/modals/NameModal";

export default function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState(0);
  const [deleteProjectId, setDeleteProjectId] = useState(0);
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

  const createProject = (name) => {
    $.ajax({
      url: "http://localhost:8001/project/create",
      type: "POST",
      data: {
        name: name,
        users_id: JSON.stringify([user.id]),
      },
      success: function (resp) {
        toast({
          title: "Project created",
          description: "Name : " + name,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setOpenCreate(false);
        getProjectsByUser();
      },
      error: function (error) {
        toast({
          title: "Error",
          description: error,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log(error);
      },
    });
  };

  const renameProject = (projectId, name) => {
    $.ajax({
      url: "http://localhost:8001/project/update",
      type: "POST",
      data: {
        id: projectId,
        name: name,
      },
      success: function (resp) {
        toast({
          title: "Project renamed",
          description: "Name : " + name,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setRenameProjectId(0);
        getProjectsByUser();
      },
      error: function (error) {
        toast({
          title: "Error",
          description: error,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log(error);
      },
    });
  };

  return (
    <>
      <Container
        maxW={"container.xls"}
        bg={useColorModeValue("gray.50", "gray.800")}
        py={4}
      >
        <Flex mb={4} justifyContent={"space-between"}>
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
          <Center w="200px" h="100px">
            <Button
              leftIcon={<AddIcon />}
              colorScheme={"blue"}
              onClick={() => setOpenCreate(true)}
            >
              New project
            </Button>
          </Center>
        </Flex>

        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
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
                        onClick={() => setRenameProjectId(project.id)}
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
                        onClick={() => setDeleteProjectId(project.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Wrap>
        </Box>
      </Container>
      <NameModal
        title={"Create a project"}
        isOpen={openCreate}
        cancelAction={() => setOpenCreate(false)}
        saveAction={createProject}
      />
      <NameModal
        title={"Rename project"}
        isOpen={renameProjectId}
        cancelAction={() => setRenameProjectId(0)}
        saveAction={(name) => renameProject(renameProjectId, name)}
      />
      <ConfirmDeleteDialog
        title={"Delete project"}
        text={"Do you really want to delete this project ?"}
        deleteAction={deleteProject}
        cancelAction={() => setDeleteProjectId(0)}
        objectId={deleteProjectId}
      />
    </>
  );
}

export const getServerSideProps = requireAuth;
