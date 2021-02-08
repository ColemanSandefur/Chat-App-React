import { FetchResult, gql, MutationFunctionOptions, useMutation } from "@apollo/client";
import React from "react";
import { useContext } from "react";
import { AuthData } from "../contexts/AuthData";

const MESSAGE_MUTATION = gql`
    mutation SendMessage($authKey: String!, $message: String!, $chatID: String!) {
        addMessage(authKey: $authKey, message: $message, chatID: $chatID){
            id
        }
    }
`;

interface AddMessageData {
    addMessage: {
        id: string
    }
}

interface AddMessageVars {
    authKey: string,
    message: string,
    chatID: string
}

interface ChatBoxState {
    inputText: string,
    inputArea?: EventTarget & HTMLTextAreaElement
}

export default class ChatBox extends React.Component<{chatID: string}, ChatBoxState> {
    constructor(props: any) {
        super(props);

        this.state = {
            inputText: ""
        }
    }

    onSumbit = (id: string) => {
        if (this.state.inputArea === undefined) {
            return;
        }

        let inputArea = this.state.inputArea;
        inputArea.value="";

        this.setState({inputText: ""});
    }

    handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState(
            {
                inputText: event.target.value,
                inputArea: event.target
            }
        );
    }

    render() {
        let inputText = <InputText message={this.state.inputText} chatID={this.props.chatID} onChange={this.handleChange} onSubmit={this.onSumbit} />
        let submitButton = <SubmitButton message={this.state.inputText} chatID={this.props.chatID} onSubmit={this.onSumbit} />

        return (
            <div className="chat-box">
                {submitButton}
                {inputText}
            </div>
        );
    }
}

function GetData(
    data: (options?: MutationFunctionOptions<AddMessageData, AddMessageVars> | undefined) => Promise<FetchResult<AddMessageData, Record<any, any>, Record<any, any>>>, 
    onSubmit: (id: string) => void, 
    vars: AddMessageVars
) {
    if (vars.message.trim().length > 0) {
        data({variables: vars}).then((value) => {
            if (value.data === undefined || value.data === null || value.data.addMessage === null) {
                return;
            }

            onSubmit(value.data.addMessage.id);
        });
    }
}

function SubmitButton(props: {message?: string, onSubmit: (id: string) => void, chatID: string}) {
    let authData = useContext(AuthData);
    const [sendKey] = useMutation<AddMessageData, AddMessageVars>(MESSAGE_MUTATION);

    return <button 
        onClick={(e) => {
            GetData(sendKey, props.onSubmit, {authKey: authData.authCookie + "", message: props.message + "", chatID: props.chatID});
        }}
    >send</button>
}

function InputText(props: {message?: string, onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void, onSubmit: (id: string) => void, chatID: string}) {
    let authData = useContext(AuthData);
    const [sendKey] = useMutation<AddMessageData, AddMessageVars>(MESSAGE_MUTATION);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

        if (e.key === 'Enter') {
            GetData(sendKey, props.onSubmit, {authKey: authData.authCookie + "", message: props.message + "", chatID: props.chatID})
            
            e.preventDefault();
        }

    }

    return <span className="input-wrapper"><textarea onKeyPress={handleKeyPress} onChange={props.onChange}></textarea></span>
}