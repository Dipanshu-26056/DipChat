import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Container, Box, Text, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

const Homepage = () => {
  const history = useHistory();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if(user) history.push("/chats");

  },[history]);
  return (
    <Container maxW="xl" centerContent>
      <Box
  p={1}
  bg="white"
  w="90%"
  borderRadius="lg"
  borderWidth="1px"
  textAlign="center"
>
  <Text
    w="100%"
    fontSize="5xl"
    fontFamily="Work Sans"
    fontWeight="bold"
    letterSpacing="2px"
  >
    𝓓𝓲𝓹𝓒𝓱𝓪𝓽
  </Text>

  <Text
    w="100%"
    mt={4}
    fontSize="2xl"
    letterSpacing="1px"
    color="gray.600"
  >
    ────── 📩 ──────
    <br/>

    Connect Beyond Words
  </Text>
      </Box>
      <Box m="2em" bg="white" w="90%" p={4} borderRadius="1g" color="black" borderWidth="1px">
        <Tabs variant="soft-rounded">
  <TabList mb="1em">
    <Tab width="50%">Login</Tab>
    <Tab width="50%">Sign Up</Tab>
  </TabList>

  <TabPanels>
    <TabPanel>
      
      <Login/>
      
    </TabPanel>

    <TabPanel>
      <Signup />
    </TabPanel>
  </TabPanels>
</Tabs>


      </Box>

    


    </Container>
  );
};

export default Homepage;
