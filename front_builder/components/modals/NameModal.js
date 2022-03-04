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
} from "@chakra-ui/react";
import { useRef } from "react";

export default function NameModal({
  title,
  textButton,
  isOpen,
  saveAction,
  cancelAction,
}) {
  const nameInput = useRef();

  return (
    <Modal isOpen={isOpen} onClose={cancelAction}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel htmlFor={"name"}>Name</FormLabel>
            <Input id="name" type="text" ref={nameInput} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => saveAction(nameInput.current.value)}
          >
            {textButton}
          </Button>
          <Button onClick={cancelAction}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
