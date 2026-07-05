import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  IconButton,
  FormControl,
  useToast,
  Input,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from "axios"

import './style.css';
import ScrollableChat from "./ScrollableChat";
import io from 'socket.io-client'
import Lottie from "react-lottie"
import animationData from "../animations/typing.json";             

const ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:3000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages,setMessages] = useState([])
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  const [socketConnected, setsocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const toast = useToast();
    const {user , selectedChat, setSelectedChat, notification, setNotification} = ChatState();
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {

          const config = {
            headers: {
              
              Authorization: `Bearer ${user.token}`,

            },
          };

          setLoading(true)
          const {data} = await axios.get(`/api/message/${selectedChat._id}`,
            config
          );
          console.log(messages);
          setMessages(data);
          setLoading(false);

          socket.emit("join chat", selectedChat._id);

      } catch (error){
          toast({
            title: "Error Ocuured!",
            description: "Failed to Load the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

      }

    };

    useEffect(() => {
      socket = io(ENDPOINT);
      socket.emit("setup",user)
      socket.on("connected", () => setsocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));

    },[]);

    useEffect(() => {
      fetchMessages();
      selectedChatCompare = selectedChat;


    },[selectedChat]);

    console.log(notification, "---------");

    useEffect(() => {
      socket.on("message received", (newMessageReceived) => {
        if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id ){
          if(!notification.includes(newMessageReceived)){
            setNotification([newMessageReceived, ...notification]);
            setFetchAgain(!fetchAgain);

          }

          
        } else {
          setMessages([...messages, newMessageReceived]);
        }

      });

    })


    const sendMessage = async (event) => {
      if(event.key === "Enter" && newMessage){
        socket.emit('stop typing' ,selectedChat._id);

        try{
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`

            },
          };
          setNewMessage("");
          const {data} = await axios.post('/api/message',{
            content: newMessage,
            chatId:selectedChat._id

          },
          config
        );
        console.log(data);

        socket.emit("new message", data);
        
        setMessages([...messages, data]);

        } catch (error){
          toast({
            title: "Error Ocuured!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
          });

        }

      }
    };



const typingHandler = (e) => {
  setNewMessage(e.target.value);
  console.log("socketConnected:", socketConnected);

  if(!socketConnected) return;

  if (!typing) {
    setTyping(true)
    console.log("emitting typing for chat:", selectedChat._id);
    socket.emit('typing',selectedChat._id);
  }
  let lastTypingTime = new Date().getTime()
  var timerLength = 3000;
  setTimeout(() => {

    var timeNow = new Date().getTime();
    var timeDiff = timeNow - lastTypingTime;

    if(timeDiff >= timerLength && typing){
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }

  }, timerLength);
};

const handleSummarize = async () => {
  if (!messages || messages.length === 0) {
    toast({
      title: "No messages to summarize",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }
  setSummarizing(true);
  onOpen();
  try {
    const formattedMessages = messages.map(
      (m) => `${m.sender.name}: ${m.content}`
    );
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post(
      "/api/summarize",
      { messages: formattedMessages },
      config
    );
    setSummary(data.summary);
  } catch (error) {
    setSummary("Failed to generate summary. Please try again.");
  }
  setSummarizing(false);
};

  return <>{
    selectedChat ? (
        <>
            <Text
              fontSize={{base: "28px", md:"30px"}}
              pb={3}
              px={2}
              w="100%"
              fontFamily="Work sans"
              d="flex"
              justifyContent={{ base: "space-between" }}
              alignItems="center"
            

            >
                <IconButton
                  d={{ base: "flex", md: "none"}}
                  icon={<ArrowBackIcon/>}
                  onClick={() => setSelectedChat("")}
                />
                {!selectedChat.isGroupChat ? (
                    <>
                    {getSender(user,selectedChat.users)}
                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                    </>
                ) : (
                    <>
                      {selectedChat.chatName.toUpperCase()}
                      <UpdateGroupChatModal
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                        fetchMessages={fetchMessages}
                      />
                    </>
                )}
                <IconButton
                  icon={<InfoOutlineIcon />}
                  onClick={handleSummarize}
                  size="sm"
                  aria-label="Summarize chat"
                />

            </Text>
            <Box
              d="flex"
              flexDir="column"
              justifyContent="flex-end"
              p={3}
              bg="#E8E8E8"
              w="100%"
              h="100%"
              borderRadius="lg"
              overflowY="hidden"
            >
              {loading ? (
  <Spinner
    size="xl"
    w={20}
    h={20}
    alignSelf="center"
    margin="auto"
  />
) : (
  <div className="messages">
    <ScrollableChat messages={messages} />
  </div>
)}


                <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                 {isTyping?<div>
                  <Lottie
                    options={defaultOptions}
                    
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0}}
                  />

                 </div> : <></>}


                  <Input 
                    variant="filled"
                    bg="#E0E0E0"
                    placeholder="Enter a message.."
                    onChange={typingHandler}
                    value={newMessage}
                    />
                  
                </FormControl>
               

            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Chat Summary</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  {summarizing ? <Spinner /> : <Text>{summary}</Text>}
                </ModalBody>
              </ModalContent>
            </Modal>
        </>

    ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                Click on a user to start chat
            </Text>
        </Box>

    )
  }
  </>;

  
};

export default SingleChat