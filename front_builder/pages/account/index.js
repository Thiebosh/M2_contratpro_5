import {
  Avatar,
  Container,
  Flex,
  Input,
  Stack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import RequireAuth from "../../components/utils/RequireAuth";
import { withSessionSsr } from "../../lib/withSession";

export default function Account() {
  return (
    <Container maxW="container.lg">
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

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req, res }) {
    const { user } = req.session;
    console.log("user", user);
    console.log("session", req.session);

    if (!user) {
      return {
        redirect: {
          destination: "/account/login",
          permanent: false,
        },
      };
    }

    return {
      props: { user },
    };
  }
);
