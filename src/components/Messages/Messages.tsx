import { gql, useLazyQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "./Messages.scss";
import {socket} from "../../services/SocketIO";
import {AuthData} from "../contexts/AuthData";
import { useRef } from "react";
import { SideBar } from "./SideBar";
import { cloneMap, toArray } from "../../services/MapHelpers";

const MESSAGE_QUERY = gql`
    query GetMessage($id: ID, $authKey: String, $chatID: ID!){
        chat(authKey: $authKey, chatID: $chatID) {
            chatID,
            message(authKey: $authKey, id: $id) {
                text,
                id,
                userID
            }
        }
    }
`;

interface GetMessageData {
    chat: {
        chatID: number
        message: {
            text: string,
            id: number,
            userID: number
        }[]
    }[]
}

interface GetMessageVars {
    id?: number;
    authKey?: string;
    chatID: number
}

export class Message extends React.Component<{isOwner: boolean, text: string}> {
    render() {
        let message = this.props.text
        let className = "message " + (this.props.isOwner?" owner" : "");
        return (
            <div className={className}><div>{message}</div></div>
        );
    }
}

const GetMessages = (props: {userID: number, id?: number, chatID: number}) => {
    const [getMessage, {data, error}] = useLazyQuery<GetMessageData, GetMessageVars>(MESSAGE_QUERY, {fetchPolicy: "no-cache"});
    let [messages, setMessages] = useState<{[id: number]: JSX.Element}>({});
    let authData = useContext(AuthData);
    let lastMessageRef: React.RefObject<HTMLDivElement> = useRef(null);

    //on mount
    useEffect(() => {
        getMessage({variables: {authKey: authData.authCookie, id: props.id, chatID: props.chatID}});

        socket.on("New-Message", (id: number) => {
            getMessage({variables: {authKey: authData.authCookie, id: id, chatID: props.chatID}});
        })

        //on unmount
        return () => {
            socket.off("New-Message");
        }
    }, [authData.authCookie, props.id, props.chatID, getMessage]);

    //on every update scroll to the last element
    useEffect(() => {
        const bounding = lastMessageRef.current?.getBoundingClientRect();

        if (bounding !== undefined) {
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    });

    const updateMessages = (data: {id: number, message: JSX.Element}[]) => {
        let newMessages: {[id: number]: JSX.Element} = cloneMap(messages);

        let hasChanged = false;

        data.forEach(el => {
            if (newMessages[el.id] === undefined) {
                newMessages[el.id] = el.message;
                hasChanged = true;
            }
        });

        if (hasChanged) {
            setMessages(newMessages);
        }
    }

    //Changes what is rendered if there is an error
    if (error) return <div>Error!</div>

    /*
        Update messages
    */

    if (data !== undefined && data !== null && data.chat !== null && data.chat[0].message !== null) {
        let updateData: {
            id: number;
            message: JSX.Element;
        }[] = [];

        data.chat[0].message.forEach(data => {
            if (data !== null) {
                // eslint-disable-next-line
                let message = <Message isOwner={data.userID == props.userID} text={data.text} key={data.id}/>;
                
                updateData.push({id: data.id, message: message});
            }
        });
            
        updateMessages(updateData);
    }

    /*
        Render
    */

    return (
        <div className="messages-div">
            {toArray(messages)}
            <div ref={lastMessageRef} />
            <ChatBox chatID={props.chatID} />
        </div>
    );
}

/*
    main component
*/

class Messages extends React.Component<{}, {chatID: number}> {
    constructor(props: any) {
        super(props);

        this.state = {
            chatID: 0
        }
    }

    render() {
        return (
            <div>
                <SideBar setChat={(chat: number) => {this.setState({chatID: chat})}}></SideBar>
                <GetMessages userID={0} chatID={this.state.chatID} key={this.state.chatID}/>
            </div>
            
        );
    }
}

export default Messages;

