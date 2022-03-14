import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { withSessionSsr } from "../../lib/withSession";
import axios from "axios";
import { useRef } from "react";
import Link from "next/link";

export default function Create() {
  const router = useRouter();
  const createUsernameInput = useRef();
  const createPasswordInput = useRef();
  const toast = useToast();

  const handleClick = () => {
    fetch('http://localhost:8001/account/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: createUsernameInput.current.value,
        password: createPasswordInput.current.value,
      })
    })
    .then(resp => JSON.parse(resp))
    .then(resp => {
      if (resp.success === "already exist") {
        toast({
          title: "Account already exist",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else if (resp.success === true) {
        toast({
          title: "Account created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/auth/login");
      } else if (resp.success === false) {
        toast({
          title: "Error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      console.log(resp);
    })
    .catch(error => {
        toast({
          title: "Error",
          description: "erreur",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.log("failure");
        console.log(error);
    });
  };

  return (
    <Flex
      minH={"90vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={6} mx={"auto"} maxW={"lg"} py={6} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Create account</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Username</FormLabel>
              <Input type="text" name={"username"} ref={createUsernameInput} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name={"password"}
                ref={createPasswordInput}
              />
            </FormControl>
            <Stack spacing={10}>
              <Button
                mt={4}
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={handleClick}
              >
                Create
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req, res }) {
    const { user } = req.session;

    if (user) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  }
);
