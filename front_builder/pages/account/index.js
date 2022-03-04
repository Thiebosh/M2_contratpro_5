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
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import $ from "jquery";
import { useRef } from "react";
import requireAuth from "../../middleware/requireAuth";

export default function Account({ user }) {
  const newUserNameInput = useRef();
  const newPasswordInput = useRef();
  const toast = useToast();

  function changeDataAccount() {
    const data = {
      id: user.id,
      name: newUserNameInput.current.value,
      password: newPasswordInput.current.value,
    };
    $.ajax({
      url: "http://localhost:8001/account/update",
      type: "POST",
      data: data,
      success: function (resp) {
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
      },
      error: function () {
        toast({
          title: "Error",
          description: "erreur rrjsncs",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log("failure");
      },
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
          <Heading lineHeight={1.1} fontSize={{ base: "xl", sm: "3xl" }}>
            User Profile Edit
          </Heading>

          <Avatar size="xl" src="https://bit.ly/code-beast" />

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
