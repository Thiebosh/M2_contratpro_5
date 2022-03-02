import {
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { withSessionSsr } from "../../lib/withSession";
import axios from "axios";
import { useRef } from "react";

export default function Login() {
  const router = useRouter();

  const handleClick = () => {
    axios
      .post("/api/auth/login", {
        username: usernameInput.current.value,
        password: passwordInput.current.value,
      })
      .then(() => router.push("/dashboard"))
      .catch((err) => console.log(err));
  };

  return (
    <Flex
      minH={"80vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={6} mx={"auto"} maxW={"lg"} py={6} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Logout</Heading>
        </Stack>
        <Text>Please wait while processing...</Text>
      </Stack>
    </Flex>
  );
}

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req, res }) {
    const { user } = req.session;

    if (!user) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    await req.session.destroy();
    return {
      redirect: {
        destination: "/account/login",
        permanent: false,
      },
    };
  }
);
