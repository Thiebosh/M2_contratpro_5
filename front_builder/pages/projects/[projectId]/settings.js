import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Input,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import $ from "jquery";
import requireAuth from "../../../middleware/requireAuth";
import { useRouter } from "next/router";
import ProjectAddUsersModal from "../../../components/modals/ProjectAddUsersModal";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

export default function Settings({ user }) {
  const toast = useToast();
  const renameInput = useRef();
  const router = useRouter();
  const projectName = "";
  const { projectId } = router.query;
  const [dataProject, setDataProject] = useState({ name: "", users: [] });
  const [addUserIsOpen, setAddUserIsOpen] = useState(false);

  function getProject() {
    $.ajax({
      url: "http://localhost:8001/project/search",
      type: "POST",
      data: {
        id: projectId,
      },
      success: function (resp) {
        setDataProject(resp.result[0]);
        console.log(resp.result[0]);
      },
      error: function () {
        console.log("failure");
      },
    });
  }

  useEffect(() => {
    getProject();
  }, []);

  return (
    <>
      <Container
        maxW={"container.xls"}
        bg={useColorModeValue("gray.50", "gray.800")}
      >
        <Heading fontSize={"4xl"} my={4}>
          Settings {dataProject.name} project
        </Heading>
        <Box
          mx={"auto"}
          w={"100%"}
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Heading size={"md"} mb={3}>
            Manage users
          </Heading>
          <Box maxW={"45%"}>
            {dataProject.users.map((user) => (
              <Flex key={user.id} direction={"row"}>
                <Input
                  variant="filled"
                  mb={2}
                  isDisabled
                  placeholder={user.name}
                />
                <IconButton
                  aria-label="delete"
                  ml={3}
                  icon={<DeleteIcon />}
                  onClick={() => deleteUserFromProject(projectId, user.id)}
                />
              </Flex>
            ))}
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme={"blue"}
            px={3}
            mt={5}
            onClick={() => setAddUserIsOpen(true)}
          >
            Add users
          </Button>
        </Box>
      </Container>
      <ProjectAddUsersModal
        isOpen={addUserIsOpen}
        setIsOpen={setAddUserIsOpen}
        projectId={projectId}
      />
    </>
  );

  function deleteUserFromProject(projectId, userIdToDelete) {
    console.log(userIdToDelete);
    $.ajax({
      url: "http://localhost:8001/project/remove_user",
      type: "POST",
      data: {
        id: projectId,
        user_id: userIdToDelete,
      },
      success: function (resp) {
        getProject();
        console.log(resp);
      },
      error: function () {
        console.log("failure");
      },
    });
  }
}

export const getServerSideProps = requireAuth;
