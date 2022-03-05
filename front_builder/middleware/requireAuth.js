import { withSessionSsr } from "../lib/withSession";

const requireAuth = async function getServerSideProps({ req }) {
  const { user } = req.session;

  if (!user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { user },
  };
};

export default withSessionSsr(requireAuth);
