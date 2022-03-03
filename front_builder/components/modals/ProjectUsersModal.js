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

export default function ProjectUsersModal({ projectId, setProjectId }) {
  const toast = useToast();
  const nameInput = useRef();

  const handleSave = () => {
    $.ajax({
      url: "http://localhost:8001/project/update",
      type: "POST",
      data: {
        id: projectId,
        name: nameInput.current.value,
      },
      success: function (resp) {
        toast({
          title: "Project renamed",
          description: "Name : " + nameInput.current.value,
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
    setProjectId(0);
  }

  return (
    <Modal isOpen={projectId} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Users</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input id="name" type="text" ref={nameInput} />
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
