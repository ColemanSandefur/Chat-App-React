import { FetchResult, gql, MutationFunctionOptions, useMutation } from "@apollo/client";
import React from "react";
import { useContext } from "react";
import { AuthData } from "../../App";

const MESSAGE_MUTATION = gql`
    mutation SendMessage($authKey: String!, $message: String!) {
        addMessage(authKey: $authKey, message: $message){
            id
        }
    }
`;

interface AddMessageData {
    addMessage: {
        id: number
    }
}

interface AddMessageVars {
    authKey: string,
    message: string
}

interface ChatBoxState {
    inputText: string,
    inputArea?: EventTarget & HTMLTextAreaElement
}

export default class ChatBox extends React.Component<{addMessage: (data: number[]) => void}, ChatBoxState> {
    constructor(props: any) {
        super(props);

        this.state = {
            inputText: ""
        }
    }

    onSumbit = (id: number) => {
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
        let inputText = <InputText message={this.state.inputText} onChange={this.handleChange} onSubmit={this.onSumbit} />
        let submitButton = <SubmitButton message={this.state.inputText} onSubmit={this.onSumbit} />

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
    authKey: string,
    message?: string,
) {
    if (message !== undefined) {
        data({variables: {authKey: authKey, message: message}}).then((value) => {
            if (value.data === undefined || value.data === null || value.data.addMessage === null) {
                return;
            }

            onSubmit(value.data.addMessage.id);
        });
    }
}

function SubmitButton(props: {message?: string, onSubmit: (id: number) => void}) {
    let authData = useContext(AuthData);
    const [sendKey] = useMutation<AddMessageData, AddMessageVars>(MESSAGE_MUTATION);

    return <button 
        onClick={(e) => {
            GetData(sendKey, props.onSubmit, authData.authCookie + "", props.message);
        }}
    >send</button>
}

function InputText(props: {message?: string, onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void, onSubmit: (id: number) => void}) {
    let authData = useContext(AuthData);
    const [sendKey] = useMutation<AddMessageData, AddMessageVars>(MESSAGE_MUTATION);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

        if (e.key === 'Enter') {
            GetData(sendKey, props.onSubmit, authData.authCookie + "", props.message)
            
            e.preventDefault();
        }

    }

    return <span className="input-wrapper"><textarea onKeyPress={handleKeyPress} onChange={props.onChange}></textarea></span>
}