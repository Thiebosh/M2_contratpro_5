import {
  Box,
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
import { useEffect, useRef, useState } from "react";
import $ from "jquery";
import { Autocomplete, Option } from "chakra-ui-simple-autocomplete";

export default function ProjectAddUsersModal({ projectId, isOpen, setIsOpen }) {
  const toast = useToast();
  const nameInput = useRef();
  const [result, setResult] = useState([]);
  const [options, setOptions] = useState([]);

  function searchUser(partOfTheUserName) {
    $.ajax({
      url: "http://localhost:8001/account/search",
      type: "POST",
      data: {
        name: partOfTheUserName,
      },
      success: function (resp) {
        console.log(resp);
      },
      error: function (error) {
        console.log(error);
      },
    });
  }

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

        <Box maxW="md">
          <Autocomplete
            options={options}
            result={result}
            setResult={() => setResult(options)}
            placeholder="Autocomplete"
          />
        </Box>
      </ModalContent>
    </Modal>
  );
}
