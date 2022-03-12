import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  forwardRef,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useToast,
  Wrap,
  Link,
  WrapItem,
} from "@chakra-ui/react";
import dayjs from "dayjs";

import { AddIcon, DeleteIcon, EditIcon, SettingsIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import requireAuth from "../../middleware/requireAuth";
import ConfirmDeleteDialog from "../../components/dialogs/ConfirmDeleteDialog";
import NameModal from "../../components/modals/NameModal";
import * as PropTypes from "prop-types";
import NextLink from "next/link";

NextLink.propTypes = { children: PropTypes.node };
export default function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState(0);
  const [deleteProjectId, setDeleteProjectId] = useState(0);
  const toast = useToast();

  function getProjectsByUser() {
    fetch('http://localhost:8001/project/search_by_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: user.id,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      setProjects(resp.result);
    })
    .catch(error => {
        console.log("failure");
        console.log(error);
    });
  }

  useEffect(() => {
    getProjectsByUser();
  }, []);

  /* HANDLE FUNCTIONS */
  function deleteProject(projectID) {
    fetch('http://localhost:8001/project/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: projectID,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      toast({
        title: "Project deleted",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      getProjectsByUser();
      setDeleteProjectId(0);
    })
    .catch(error => {
      toast({
        title: "Delete failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log("failure");
      console.log(error);
    });
  }

  const createProject = (name) => {
    fetch('http://localhost:8001/project/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        users_id: JSON.stringify([user.id]),
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      toast({
        title: "Project created",
        description: "Name : " + name,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setOpenCreate(false);
      getProjectsByUser();
    })
    .catch(error => {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log("failure");
      console.log(error);
    });
  };

  const renameProject = (projectId, name) => {
    fetch('http://localhost:8001/project/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: projectId,
        name: name,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      toast({
        title: "Project renamed",
        description: "Name : " + name,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      setRenameProjectId(0);
      getProjectsByUser();
    })
    .catch(error => {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log("failure");
      console.log(error);
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
                    <Td>
                      <NextLink href={`/projects/${project.id}`}>
                        <Link color="teal.500">{project.name}</Link>
                      </NextLink>
                    </Td>
                    <Td>{dayjs(project.creation).format("D MMMM YYYY")}</Td>
                    <Td>{dayjs(project.last_specs).format("D MMMM YYYY")}</Td>
                    <Td>
                      <Tooltip label={"Rename"}>
                        <IconButton
                          mx={1}
                          icon={<EditIcon />}
                          onClick={() => setRenameProjectId(project.id)}
                        />
                      </Tooltip>
                      <NextLink href={`/projects/${project.id}/settings`}>
                        <IconButton mx={1} icon={<SettingsIcon />} />
                      </NextLink>
                      <Tooltip label={"Delete"}>
                        <IconButton
                          mx={1}
                          icon={<DeleteIcon />}
                          onClick={() => setDeleteProjectId(project.id)}
                        />
                      </Tooltip>
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
        textButton={"Create"}
      />
      <NameModal
        title={"Rename project"}
        isOpen={renameProjectId}
        cancelAction={() => setRenameProjectId(0)}
        saveAction={(name) => renameProject(renameProjectId, name)}
        textButton={"Save"}
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
