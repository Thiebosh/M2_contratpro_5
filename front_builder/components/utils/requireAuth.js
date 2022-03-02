import { withSessionSsr } from "../../lib/withSession";

const requireAuth = async function getServerSideProps({ req }) {
  const { user } = req.session;

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
};

export default withSessionSsr(requireAuth);
