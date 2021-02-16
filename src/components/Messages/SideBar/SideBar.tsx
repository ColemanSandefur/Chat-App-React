import { gql, useLazyQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import { cloneMap, toArray } from "../../../services/MapHelpers";
import { AuthData } from "../../contexts/AuthData";
import AddChat from "../AddChat";
import ChatSettings from "./ChatSettings";
import "./SideBar.scss";

const CHAT_QUERY = gql`
    query GetChat($authKey: String, $chatID: String){
        chat(authKey: $authKey, chatID: $chatID) {
            chatID,
            chatName,
            imageURL,
        }
    }
`;

interface ChatData {
    chatID: string,
    chatName: string,
    imageURL?: string
}

interface GetChatData {
    chat: ChatData[]
}

interface GetChatVars {
    authKey?: string;
    chatID?: string
}

function ChatRoom(props: ChatData & {setChat: (chatID: string) => void}) {
    return (
        <div className="chat-room-link" onClick={() => props.setChat(props.chatID)} 
            style={{
                backgroundImage: `url("${props.imageURL}")`,
                backgroundSize: "contain",
            }}
            data-tooltip={props.chatName}
        >
        </div>
    )
}

function CreateChatRoom(props: {onClick: () => void}) {
    return (
        <div className="chat-room-link create" onClick={props.onClick}>
            <div/>
        </div>
    )
}

export function SideBar(props: {chatID: string, setChat: (chatID: string) => void}) {
    const [getChat, {data}] = useLazyQuery<GetChatData, GetChatVars>(CHAT_QUERY, {fetchPolicy: "no-cache"});
    let [chats, setChats] = useState<{[id: string]: JSX.Element}>({});
    let authData = useContext(AuthData);
    const [addChatOpen, setAddChatOpen] = useState<boolean>(false);

    //get chats on first load
    useEffect(() => {
        getChat({variables: {authKey: authData.authCookie}});
    }, [getChat, authData]);

    //if no chat is being displayed make a chat displayed
    useEffect(() => {
        if (props.chatID === "" && Object.keys(chats).length > 0) {
            props.setChat(Object.keys(chats)[0]);
        }
    }, [props, chats])

    const updateChats = (data: {id: string, chat: JSX.Element}[]) => {
        let newChats: {[id: string]: JSX.Element} = cloneMap(chats);

        let hasChanged = false;

        data.forEach(element => {
            if (newChats[element.id] === undefined) {
                newChats[element.id] = element.chat;
                hasChanged = true;
            }
        });

        if (hasChanged) {
            setChats(newChats);
        }
    }

    const refreshSideBar = () => {
        getChat({variables: {authKey: authData.authCookie}});
    }

    const setDisplayingAddChat = (state: boolean) => {
        setAddChatOpen(state);
    }

    //if data exists update the messages
    if (data !== undefined && data !== null && data.chat !== null) {
        let updateData = data.chat.map((data) => {
            let chat = <ChatRoom {...data} setChat={props.setChat} key={data.chatID} />

            return {id: data.chatID, chat};
        })

        updateChats(updateData)
    }

    let chatRoom = (addChatOpen === true)? <AddChat refreshSideBar={refreshSideBar} toggleVisibility={setDisplayingAddChat}/>: undefined;

    return (
        <div className="side-bar-container">
            <div className="chat-bar-container">
                <div className="chat-bar">
                    {toArray(chats)}
                    <CreateChatRoom onClick={() => {setDisplayingAddChat(true)}}/>
                    {chatRoom}
                </div>
            </div>
            <ChatSettings />
        </div>
    )
}