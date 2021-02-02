import { gql, useLazyQuery, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "./Messages.scss";

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
    let [messages, setMessages] = useState<{[id: number]: JSX.Element}>([]);

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
        console.log(newMessages);

        let hasChanged = false;

        data.forEach(el => {
            console.log(newMessages[el.id]);
            if (newMessages[el.id] === undefined) {
                newMessages[el.id] = el.message;
                hasChanged = true;
            }
        });

        if (hasChanged) {
            console.log("setting data: ", newMessages)
            setMessages(newMessages);
        }
    }

    /*
        Get data from server
    */

    // const { loading, data, error } = useQuery<GetMessageData, GetMessageVars>(
    //     MESSAGE_QUERY,
    //     {variables: {authKey: "key", id: props.id}}
    // );

    const [getMessage, {loading, data, error}] = useLazyQuery<GetMessageData, GetMessageVars>(MESSAGE_QUERY);

    //on mount
    useEffect(() => {
        getMessage({variables: {authKey: "key", id: props.id}});
    }, [])
    

    if (loading) return <div></div>
    if (error) return <div>Error!</div>
    if (data === undefined || data.message === null) return <div></div>

    /*
        Update messages
    */

    let updateData = data.message.map((data) => {
        // eslint-disable-next-line
        let message = <Message isOwner={data.userID == props.userID} text={data.text} key={data.id}/>;
        
        return {id: data.id, message: message}
    });

    updateMessages(updateData);

    /*
        Render
    */

    return (
        <div className="messages-div">
            {toArray(messages)}

            <ChatBox addMessage={(data) => {
                data.forEach(el => {
                    getMessage({variables: {authKey: "key", id: el}});
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

