import { gql, useLazyQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "./Messages.scss";
import {socket} from "../../services/SocketIO";
import {AuthData} from "../contexts/AuthData";
import { useRef } from "react";
import { SideBar } from "./SideBar/SideBar";
import { cloneMap, toArray } from "../../services/MapHelpers";

const MESSAGE_QUERY = gql`
    query GetMessage($id: String, $authKey: String, $chatID: String!){
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
        chatID: string
        message: {
            text: string,
            id: string,
            userID: string
        }[]
    }[]
}

interface GetMessageVars {
    id?: string;
    authKey?: string;
    chatID: string
}

const Message = (props: {messageUserID: string, text: string}) => {
    let authData = useContext(AuthData);
    let isOwner;

    // eslint-disable-next-line
    if (authData.userData === undefined || authData.userData.userID != props.messageUserID ) {
        isOwner = false;
    } else {
        isOwner = true;
    }

    let message = props.text;
    let className = "message " + (isOwner?" owner" : "");
    return (
        <div className={className}><div>{message}</div></div>
    );
}

const GetMessages = (props: {id?: string, chatID: string}) => {
    const [getMessage, {data, error}] = useLazyQuery<GetMessageData, GetMessageVars>(MESSAGE_QUERY, {fetchPolicy: "no-cache"});
    let [messages, setMessages] = useState<{[id: string]: JSX.Element}>({});
    let authData = useContext(AuthData);
    let lastMessageRef: React.RefObject<HTMLDivElement> = useRef(null);
    const [width, setWidth] = useState<number | undefined>();
    const ref: React.RefObject<HTMLDivElement> = useRef(null);

    //on mount; get messages in chat and listen for new ones
    useEffect(() => {
        getMessage({variables: {authKey: authData.authCookie, id: props.id, chatID: props.chatID}});

        socket.on("New-Message", (id: string) => {
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

    useEffect(() => {
        // console.log('width', ref.current ? ref.current.offsetWidth : 0);
        if (ref.current !== null) {
            setWidth(ref.current.offsetWidth);
        }
        window.addEventListener('resize', () => {
            console.log('width', ref.current ? ref.current.offsetWidth : 0);
            if (ref.current !== null) {
                setWidth(ref.current.offsetWidth);
            }
        })
    }, [messages]);

    const updateMessages = (data: {id: string, message: JSX.Element}[]) => {
        let newMessages: {[id: string]: JSX.Element} = cloneMap(messages);

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
            id: string;
            message: JSX.Element;
        }[] = [];

        data.chat[0].message.forEach(data => {
            if (data !== null) {
                // eslint-disable-next-line
                let message = <Message messageUserID={data.userID} text={data.text} key={data.id}/>;
                
                updateData.push({id: data.id, message: message});
            }
        });
            
        updateMessages(updateData);
    }

    /*
        Render
    */

    return (
        <div className="messages-div" ref={ref}>
            {toArray(messages)}
            <div ref={lastMessageRef} />
            <ChatBox chatID={props.chatID} width={width}/>
        </div>
    );
}

/*
    main component
*/

class Messages extends React.Component<{}, {chatID: string}> {
    constructor(props: any) {
        super(props);

        this.state = {
            chatID: ""
        }
    }

    render() {
        return (
            <div className={"messages-container"}>
                <SideBar chatID={this.state.chatID} setChat={(chat: string) => {this.setState({chatID: chat})}}></SideBar>
                <GetMessages chatID={this.state.chatID} key={this.state.chatID}/>
            </div>
            
        );
    }
}

export default Messages;

