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
        chatID: string
    }
}

interface CreateChatVars {
    authKey: string,
    chatName: string
}

function CloseButton(props: {toggleVisibility: (state: boolean) => void}) {
    return (
        <div className={"close-chat"}>
            <button className={"close-chat-button"} onClick={(e) => props.toggleVisibility(false)} >
            </button>
        </div>
        
    )
}


export default function AddChat(props: {refreshSideBar: () => void, toggleVisibility: (state: boolean) => void}) {
    const authData = useContext(AuthData);
    const [createChatMutation] = useMutation<CreateChatData, CreateChatVars>(CREATE_CHAT);
    const [chatName, setChatName] = useState<string>("");
    
    const createChat = () => {
        createChatMutation({variables:{authKey: authData.authCookie + "", chatName: chatName}}).then(() => {
            props.refreshSideBar();
        }).catch((error) => {
            console.log(error);
        }).then(() => {
            props.toggleVisibility(false);
        });
    }

    return (
        <div className={"add-chat-container"}>
            <div className={"add-chat"}>
                <CloseButton toggleVisibility={props.toggleVisibility}/>
                <input type="text" placeholder="chat name" 
                    onChange={(e) => setChatName(e.target.value)}
                    onKeyPress={(e) => {if (e.key === "Enter") createChat()}}
                />
                <button onClick={createChat} className={"create-chat"}>create</button>
            </div>
        </div>
    )
}