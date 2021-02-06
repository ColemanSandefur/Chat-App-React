import { gql, useMutation } from "@apollo/client";
import React, { useContext, useState } from "react";
import { AuthData } from "../contexts/AuthData";


const CREATE_CHAT = gql`
    mutation CreateChat($authKey: String!, $chatName: String!) {
        createChat(authKey: $authKey, chatName: $chatName) {
            chatID
        }
    }
`

interface CreateChatData {
    createChat: {
        chatID: number
    }
}

interface CreateChatVars {
    authKey: string,
    chatName: string
}


export default function AddChat(props: {refreshSideBar: () => void, toddleVisibility: (state: boolean) => void}) {
    const authData = useContext(AuthData);
    const [createChatMutation] = useMutation<CreateChatData, CreateChatVars>(CREATE_CHAT);
    const [chatName, setChatName] = useState<string>("");
    
    const createChat = () => {
        createChatMutation({variables:{authKey: authData.authCookie + "", chatName: chatName}}).then(() => {
            props.refreshSideBar();
        }).catch((error) => {
            console.log(error);
        }).then(() => {
            props.toddleVisibility(false);
        });
    }

    return (
        <div className={"add-chat-container"}>
            <div>
                <input type="text" placeholder="chat name" 
                    onChange={(e) => setChatName(e.target.value)}
                    onKeyPress={(e) => {if (e.key === "Enter") createChat()}}
                />
                <button onClick={createChat}>create</button>
            </div>
        </div>
    )
}