/* eslint-disable no-unused-vars */
import React from "react";
import axios from "axios";
const diskspace = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [disks, setDisks] = React.useState();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [state, setState] = React.useState(false);
  const mutation = `
  mutation CreateWorkspace($name: String!, $userId: ID!) {
    createWorkspace(name: $name, userId: $userId) {
      id
      name
      userId
    }
  }`;

  const variables = {
    name: "My New Workspace",
    userId: "123",
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const fetchAllDiskspace = () => {
      try {
        const response = axios.post("http://localhost:9999/graphql", {
          mutation,
          variables,
        });
        setDisks(response);
      } catch (err) {
        console.log(err);
        console.error(
          "sorry we are not able to fetch disk spaces at that time pelase try again later"
        );
      }
    };
    fetchAllDiskspace();
  }, [state]);
  const newArr = disks?.map((item) => item);
  // const renderdisks=()=>{

  // }
  return (
    <>
      <div>diskspace page</div>
    </>
  );
};
export default diskspace;
