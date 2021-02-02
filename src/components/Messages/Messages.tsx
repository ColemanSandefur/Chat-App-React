import { gql, useLazyQuery } from "@apollo/client";
import React, { useContext, useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "./Messages.scss";
import {socket} from "../../services/SocketIO";
import {AuthData} from "../../App";

const MESSAGE_QUERY = gql`
    query GetMessage($id: ID, $authKey: String){
        message(id: $id, authKey: $authKey){
            text,
            id,
            userID
        }
    }
`;

interface GetMessageData {
    message: {
        text: string,
        id: number,
        userID: number
    }[]
}

interface GetMessageVars {
    id?: number;
    authKey?: string;
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

const GetMessages = (props: {userID: number, id?: number}) => {
    const [getMessage, {data, error}] = useLazyQuery<GetMessageData, GetMessageVars>(MESSAGE_QUERY);
    let [messages, setMessages] = useState<{[id: number]: JSX.Element}>([]);
    let authData = useContext(AuthData);

    //on mount
    useEffect(() => {
        getMessage({variables: {authKey: authData.authCookie, id: props.id}});

        socket.on("New-Message", (id: number) => {
            getMessage({variables: {authKey: authData.authCookie, id: id}});
        })
    }, [getMessage, props.id, authData])

    const cloneMap = (map: {[key: number]: any}) => {
        var newMap:{[key: number]: any} = {};
        for (var i in map) {
            newMap[i] = map[i];
        }
        return newMap;
    }

    const toArray = (map: {[key: number]: any}) => {
        let array: any = [];

        Object.keys(map).forEach((el:any) => {
            array.push(map[el]);
        });

        return array;
    }

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

    if (data !== undefined && data !== null && data.message !== null) {
        let updateData = data.message.map((data) => {
            // eslint-disable-next-line
            let message = <Message isOwner={data.userID == props.userID} text={data.text} key={data.id}/>;
                
            return {id: data.id, message: message}
        });
        
        updateMessages(updateData);
    }

    /*
        Render
    */

    return (
        <div className="messages-div">
            {toArray(messages)}

            <ChatBox addMessage={(data) => {
                data.forEach(id => {
                    getMessage({variables: {authKey: "key", id: id}});
                })
            }}/>
        </div>
    );
}

/*
    main component
*/

class Messages extends React.Component<{}, {}> {
    render() {
        return (
            <GetMessages userID={0} key={0}/>
        );
    }
}

export default Messages;

