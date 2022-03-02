import {
  Avatar,
  Container,
  Flex,
  Input,
  Stack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import requireAuth from "../../components/utils/requireAuth";

export default function Account() {
  return (
    <Container maxW={"container.xl"}>
      <Flex>
        <div className="avatar">
          <Wrap>
            <WrapItem>
              <Avatar size="xl" src="https://bit.ly/code-beast" />
            </WrapItem>
          </Wrap>
        </div>
        <div className="infos">
          <Stack spacing={3}>
            <Input variant="flushed" placeholder="Name" />
            <Input variant="flushed" placeholder="Password" />
          </Stack>
        </div>
      </Flex>
    </Container>
  );
}

export const getServerSideProps = requireAuth;
