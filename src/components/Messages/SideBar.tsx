import { gql, useLazyQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import { cloneMap, toArray } from "../../services/MapHelpers";
import { AuthData } from "../contexts/AuthData";
import AddChat from "./AddChat";

const CHAT_QUERY = gql`
    query GetChat($authKey: String, $chatID: ID){
        chat(authKey: $authKey, chatID: $chatID) {
            chatID,
            chatName,
            imageURL,
        }
    }
`;

interface ChatData {
    chatID: number,
    chatName: string,
    imageURL?: string
}

interface GetChatData {
    chat: ChatData[]
}

interface GetChatVars {
    authKey?: string;
    chatID?: number
}

function ChatRoom(props: ChatData & {setChat: (chatID: number) => void}) {
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

export function SideBar(props: {setChat: (chatID: number) => void}) {
    const [getChat, {data}] = useLazyQuery<GetChatData, GetChatVars>(CHAT_QUERY, {fetchPolicy: "no-cache"});
    let [chats, setChats] = useState<{[id: number]: JSX.Element}>([]);
    let authData = useContext(AuthData);
    const [addChatOpen, setAddChatOpen] = useState<boolean>(false);

    useEffect(() => {
        getChat({variables: {authKey: authData.authCookie}});
    }, [getChat, authData]);

    const updateMessages = (data: {id: number, chat: JSX.Element}[]) => {
        let newChats: {[id: number]: JSX.Element} = cloneMap(chats);

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

        updateMessages(updateData)
    }

    let chatRoom = (addChatOpen === true)? <AddChat refreshSideBar={refreshSideBar} toddleVisibility={setDisplayingAddChat}/>: undefined;

    return (
        <div className="side-bar">
            {toArray(chats)}
            <CreateChatRoom onClick={() => {setDisplayingAddChat(true)}}/>
            {chatRoom}
        </div>
    )
}