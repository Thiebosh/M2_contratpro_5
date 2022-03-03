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
import { useRef } from "react";
import $ from "jquery";
import requireAuth from "../../components/utils/requireAuth";

export default function ProjectsCreate({ user }) {
  const toast = useToast();
  const nameInput = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    $.ajax({
      url: "http://localhost:8001/project/create",
      type: "POST",
      data: {
        name: nameInput.current.value,
        user_id: user.id,
      },
      success: function (resp) {
        toast({
          title: "Project created",
          description: "Name : " + nameInput.current.value,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        console.log(resp);
      },
      error: function () {
        toast({
          title: "Error",
          description: "Name : " + nameInput.current.value,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log("failure");
      },
    });
  };

  return (
    <Flex
      minH={"80vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Box
        mx={"auto"}
        maxW={"lg"}
        w={"100%"}
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"lg"}
        p={8}
      >
        <Stack spacing={4}>
          <Heading fontSize={"4xl"} align={"center"} mb={4}>
            New project
          </Heading>
          <form onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input id="name" type="text" ref={nameInput} />
            </FormControl>
            <Button
              mt={6}
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
              type={"submit"}
            >
              Create
            </Button>
          </form>
        </Stack>
      </Box>
    </Flex>
  );
}

export const getServerSideProps = requireAuth;
