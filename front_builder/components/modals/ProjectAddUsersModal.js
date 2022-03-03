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

export default function ProjectAddUsersModal({ projectId, isOpen, setIsOpen }) {
  const toast = useToast();
  const nameInput = useRef();

  const handleSave = () => {
    $.ajax({
      url: "http://localhost:8001/project/add_user",
      type: "POST",
      data: {
        id: projectId,
        user_id: nameInput.current.value,
      },
      success: function (resp) {
        console.log(resp);
      },
      error: function (error) {
        console.log(error);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(0)}>
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
            Add
          </Button>
          <Button onClick={() => setIsOpen(0)}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
