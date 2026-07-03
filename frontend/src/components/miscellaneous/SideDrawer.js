import React, { useState } from 'react';
import { Box, Text, Button, Menu, MenuButton, Tooltip, Avatar, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,useToast,Input,MenuList,
MenuItem,
MenuDivider,} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";

import {ChatState} from "../../Context/ChatProvider"
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

import {Spinner} from "@chakra-ui/spinner";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import { getSender } from '../../config/ChatLogics';
import {Effect} from 'react-notification-badge'
import NotificationBadge from 'react-notification-badge'



const SideDrawer = () => {
    const [search,setSearch] = useState("");
    const [searchResult,setSearchResult] = useState([]);
    const [loading,setloading] = useState(false);
    const [loadingChat,setLoadingChat] = useState();
    const {user, setSelectedChat,chats,setChats,notification,setNotification, } = ChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    };

    const toast = useToast();

    const handleSearch = async() => {
        if(!search) {
            toast({
                title: "please Enter something in search",
                status: "warning",
                duration: 5000,
                isCLosable: true,
                position: "top-left",
            });
            return;
        }
        try{
            setloading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };
            const {data} = await axios.get(`/api/user?search=${search}`,config);
            setloading(false);
            setSearchResult(data);

        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to Laod the search results",
                status:"error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });


        }

    };
    const accessChat = async (userId) => {
        try{
            setLoadingChat(true)
             const config = {
                headers: {
                    "Content-type":"application/json",
                    Authorization: `Bearer ${user.token}`,
                },
             };

             const {data} = await axios.post('/api/chat',{userId},config);
             if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
             setSelectedChat(data);
             setLoadingChat(false);
             onClose();


        } catch (error) {
            toast({
                title: "Error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });


        }
    };
  return (
    <>
    <Box 
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
    >
        <Tooltip
            label="Search Users to chat"
            hasArrow
            placement="bottom-end"
        >
            <Button variant="ghost" onClick={onOpen}>
                <i class="fa-brands fa-searchengin"></i>
                <Text d={{base:"none",md:"flex"}} px="4">
                    Search User
                </Text>

            </Button>
        </Tooltip>

        <Text fontSize="2xl" fontfamily="Work sans">
            𝓓𝓲𝓹𝓒𝓱𝓪𝓽
            

        </Text>
        <div>
            <Menu>
                <MenuButton p={1}>
                    <NotificationBadge
                    count={notification.length}
                    effect={Effect.SCALE}
                    />
                    <BellIcon fontSize="2xl" m={1}/>
                </MenuButton>

                
                <MenuList pl={2}>
                    {!notification.length && "No New Messages"}
                    {notification.map(notif => (
                        <MenuItem key={notif._id} 
                        onClick={() => {
    setSelectedChat(notif.chat);
    setNotification(notification.filter((n) => n.chat._id !== notif.chat._id));
}}>
                            {notif.chat.isGroupChat
  ? `New Message in ${notif.chat.chatName}`
  : `New Message from ${getSender(user, notif.chat.users)}`}
                        </MenuItem>

                    ))}
                </MenuList>

            </Menu>
            <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
                  <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic}/>
                


                </MenuButton>
                <MenuList>
                    <ProfileModal user={user}>
                    <MenuItem>My Profile</MenuItem>
                    <MenuDivider/>
                    <MenuItem onClick={logoutHandler}>Logout</MenuItem>

                    </ProfileModal>

                </MenuList>
            </Menu>
        </div>
    </Box>

    <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
            <Box d="flex" pb={2}>
                <Input
                  placeholder="Search by name or email"
                  mr={2}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  
                />
                <Button onClick={handleSearch}>Go</Button>

                

            </Box>
            {loading ? 
                <ChatLoading /> :
                (
                    searchResult?.map((user) => (
                        <UserListItem
                          key={user._id}
                          user={user}
                          
                          handleFunction={()=>accessChat(user._id)}
                        />
                    ))
                )
          
                

            }

            {loadingChat && <Spinner ml="auto" d="flex" />}

        </DrawerBody>
        </DrawerContent>



    </Drawer>
    </>
    


  );
};

export default SideDrawer;
