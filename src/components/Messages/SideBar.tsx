import { gql, useLazyQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import { cloneMap, toArray } from "../../services/MapHelpers";
import { AuthData } from "../contexts/AuthData";

const CHAT_QUERY = gql`
    query GetChat($authKey: String, $chatID: ID){
        chat(authKey: $authKey, chatID: $chatID) {
            chatID,
            imageURL,
        }
    }
`;

interface ChatData {
    chatID: number,
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
        <div className="chat-room-link" onClick={() => props.setChat(props.chatID)} style={{
            backgroundImage: `url("${props.imageURL}")`,
            backgroundSize: "contain"
        }}>

        </div>
    )
}

export function SideBar(props: {setChat: (chatID: number) => void}) {
    const [getChat, {data}] = useLazyQuery<GetChatData, GetChatVars>(CHAT_QUERY);
    let [chats, setChats] = useState<{[id: number]: JSX.Element}>([]);
    let authData = useContext(AuthData);

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

    if (data !== undefined && data !== null && data.chat !== null) {
        let updateData = data.chat.map((data) => {
            let chat = <ChatRoom {...data} setChat={props.setChat} key={data.chatID} />

            return {id: data.chatID, chat};
        })

        updateMessages(updateData)
    }

    return (
        <div className="side-bar">
            {toArray(chats)}
        </div>
    )
}