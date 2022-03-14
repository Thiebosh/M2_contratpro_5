import {
  Avatar,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import requireAuth from "../../middleware/requireAuth";
import axios from "axios";

export default function Account({ user }) {
  const newUserNameInput = useRef();
  const newPasswordInput = useRef();
  const toast = useToast();

  const [account, setAccount] = useState();

  function getAccount() {
    axios
      .get("/api/accounts/" + user.id)
      .then((res) => setAccount(res.data))
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    getAccount();
  }, []);

  /* HANDLE FUNCTIONS */
  function changeDataAccount() {
    fetch('http://localhost:8001/account/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: user.id,
        name: newUserNameInput.current.value,
        password: newPasswordInput.current.value,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      console.log(resp);
      if (resp.success === "already exist") {
        toast({
          title: "Already exist",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else if (resp.success === true) {
        toast({
          title: "Data modified",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (resp.success === false) {
        toast({
          title: "Error !",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    })
    .catch(error => {
      toast({
        title: "Error",
        description: "erreur rrjsncs",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log("failure");
      console.log(error);
    });
  }

  return (
    <Container>
      <Flex minH={"50vh"} align={"center"} justify={"center"}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.700")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}
        >
          <Heading>User Profile Edit</Heading>
          <Flex align={"center"} my={6}>
            <Avatar size="xl" src="https://bit.ly/code-beast" />
            <Text ml={4} fontSize={"2xl"}>
              {account && account.name}
            </Text>
          </Flex>

          <FormControl id="newUserNameInput">
            <FormLabel>Change your user name</FormLabel>
            <Input
              placeholder="New UserName"
              _placeholder={{ color: "gray.500" }}
              type="text"
              ref={newUserNameInput}
            />
          </FormControl>
          <FormControl id="newPasswordInput ">
            <FormLabel>Change your password</FormLabel>
            <Input
              placeholder="New password"
              _placeholder={{ color: "gray.500" }}
              type="password"
              ref={newPasswordInput}
            />
          </FormControl>
          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              bg={"blue.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "blue.500",
              }}
              onClick={changeDataAccount}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
