import { FetchResult, gql, MutationFunctionOptions, useMutation } from "@apollo/client";
import React from "react";
import { Message } from "./Messages";

const MESSAGE_MUTATION = gql`
    mutation SendMessage($authKey: String!, $message: String!) {
        addMessage(authKey: $authKey, message: $message){
            text,
            id
        }
    }
`;

interface AddMessageData {
    addMessage: {
        text: string,
        id: number
    }
}

interface AddMessageVars {
    authKey: string,
    message: string
}

interface ChatBoxState {
    inputText: string,
    inputArea: EventTarget & HTMLTextAreaElement
}

export default class ChatBox extends React.Component<{addMessage: (data: number[]) => void}, ChatBoxState> {
    constructor(props: any) {
        super(props);

        this.setState({inputText: ""});
    }

    onSumbit = (id: number) => {
        let inputArea = this.state.inputArea;
        inputArea.value="";

        this.props.addMessage([id]);

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
        let inputText;
        let submitButton;

        if (this.state != null) {
            inputText = <InputText onChange={this.handleChange} onSubmit={this.onSumbit} message={this.state.inputText} />
            submitButton = <SubmitButton message={this.state.inputText} onSubmit={this.onSumbit} />
        } else {
            inputText = <InputText onChange={this.handleChange} onSubmit={this.onSumbit} />
            submitButton = <SubmitButton onSubmit={this.onSumbit} />
        }

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
    onSubmit: (id: number) => void, 
    message?: string
) {
    if (message !== undefined) {
        data({variables: {authKey: "key", message: message}}).then((value) => {
            if (value.data === undefined || value.data === null ) {
                return;
            }

            onSubmit(value.data.addMessage.id);
        });
    }
}

function SubmitButton(props: {message?: string, onSubmit: (id: number) => void}) {
    const [sendKey] = useMutation<AddMessageData, AddMessageVars>(MESSAGE_MUTATION);

    return <button 
        onClick={(e) => {
            GetData(sendKey, props.onSubmit, props.message);
        }}
    >send</button>
}

function InputText(props: {message?: string, onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void, onSubmit: (id: number) => void}) {
    const [sendKey] = useMutation<AddMessageData, AddMessageVars>(MESSAGE_MUTATION);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

        if (e.key === 'Enter') {
            GetData(sendKey, props.onSubmit, props.message)
            
            e.preventDefault();
        }

    }

    return <span className="input-wrapper"><textarea onKeyPress={handleKeyPress} onChange={props.onChange}></textarea></span>
}