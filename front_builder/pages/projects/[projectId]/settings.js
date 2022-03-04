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
import { useEffect, useState } from "react";
import $ from "jquery";
import requireAuth from "../../../middleware/requireAuth";
import { useRouter } from "next/router";
import ProjectAddUsersModal from "../../../components/modals/ProjectAddUsersModal";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

export default function Settings({ user }) {
  const toast = useToast();
  const router = useRouter();

  const { projectId } = router.query;

  const [dataProject, setDataProject] = useState({ name: "", users: [] });
  const [addUserIsOpen, setAddUserIsOpen] = useState(false);
  const [options, setOptions] = useState([]);

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

  function getOptions() {
    axios
      .get("/api/accounts")
      .then((res) => {
        // build options
        const optns = [];
        res.data.forEach((acc) => {
          if (!dataProject.users.find((user) => user.id === acc._id)) {
            optns.push({
              value: acc._id,
              label: acc.name,
            });
          }
        });
        setOptions(optns);
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Error",
          description: "Cannot fetch accounts",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  }

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    getOptions();
  }, [dataProject]);

  /* HANDLE FUNCTIONS */
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
      },
      error: function () {
        console.log("failure");
      },
    });
  }

  function addUsers(results) {
    const errors = [];
    results.forEach(async (result) => {
      await $.ajax({
        url: "http://localhost:8001/project/add_user",
        type: "POST",
        data: {
          id: projectId,
          user_id: result.value,
        },
        error: function (error) {
          console.error(error);
          errors.push(result);
        },
      });
    });
    setAddUserIsOpen(false);
    getProject();
  }

  return (
    <>
      <Container
        maxW={"container.xls"}
        bg={useColorModeValue("gray.50", "gray.800")}
        py={8}
      >
        <Heading fontSize={"4xl"} mb={4}>
          Settings - {dataProject.name}
        </Heading>
        <Box
          mx={"auto"}
          w={"100%"}
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Heading size={"md"} mb={4}>
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
                {dataProject.users[0].id !== user.id && (
                  <IconButton
                    aria-label="delete"
                    ml={3}
                    icon={<DeleteIcon />}
                    onClick={() => deleteUserFromProject(projectId, user.id)}
                  />
                )}
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
        options={options}
        cancelAdd={() => setAddUserIsOpen(false)}
        saveAdd={addUsers}
      />
    </>
  );
}

export const getServerSideProps = requireAuth;
