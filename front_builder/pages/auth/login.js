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

export default function Login() {
  const router = useRouter();
  const usernameInput = useRef();
  const passwordInput = useRef();
  const toast = useToast();

  const handleClick = () => {
    axios
      .post("/api/auth/login", {
        username: usernameInput.current.value,
        password: passwordInput.current.value,
      })
      .then(() => {
        toast({
          title: "Loged in",
          description: "Redirecting...",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        router.push("/dashboard");
      })
      .catch((err) => {
        toast({
          title: "Login failed",
          description: "Wrong credentials",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log(err);
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
          <Heading fontSize={"4xl"}>Login</Heading>
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
              <Input type="text" name={"username"} ref={usernameInput} />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input type="password" name={"password"} ref={passwordInput} />
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
                Sign in
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
