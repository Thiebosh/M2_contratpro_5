import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import $ from "jquery";

export default function AccountCreateModal({ isOpen, setIsOpen, user }) {
  const toast = useToast();
  const usernameInput = useRef();
  const passwordInput = useRef();

  const handleSave = () => {
    console.log(user);
    $.ajax({
      url: "http://localhost:8001/account/create",
      type: "POST",
      data: {
        name: usernameInput.current.value,
        password: passwordInput.current.value,
      },
      success: function () {
        toast({
          title: "Account created",
          description: "Name : " + usernameInput.current.value,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        handleClose();
      },
      error: function (error) {
        toast({
          title: "Error",
          description: error,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log(error);
      },
    });
  };

  function handleClose() {
    nameInput.current.value = "";
    setIsOpen(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new account</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input id="username" type="text" ref={usernameInput} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="password">password</FormLabel>
            <Input id="password" type="password" ref={passwordInput} />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
