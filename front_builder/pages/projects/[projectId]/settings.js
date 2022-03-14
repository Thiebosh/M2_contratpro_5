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
    fetch('http://localhost:8001/project/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: projectId,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      setDataProject(resp.result[0]);
      console.log(resp.result[0]);
    })
    .catch(error => {
        console.log("failure");
        console.log(error);
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
    fetch('http://localhost:8001/project/remove_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: projectId,
        user_id: userIdToDelete,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      getProject();
    })
    .catch(error => {
        console.log("failure");
        console.log(error);
    });
  }

  function addUsers(results) {
    const errors = [];
    results.forEach(async (result) => { // could send array here (one call rather than n)
      await fetch('http://localhost:8001/project/add_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: projectId,
          user_id: result.value,
        })
      })
      .then(resp => JSON.parse(resp))
      .then(resp => {
        getProject();
      })
      .catch(error => {
          console.log("failure");
          console.log(error);
          errors.push(result);
      });
    });
    setAddUserIsOpen(false);
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
