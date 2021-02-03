import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { Redirect } from "react-router-dom";
import Cookies from "universal-cookie";
import { AuthData } from "../contexts/AuthData";
import "./LoginPage.scss";

export default function LoginPage(props:{}) {
    let authData = useContext(AuthData);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const cookies = new Cookies();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (username.trim().length < 1 || password.trim().length < 1) {
            return;
        }

        fetch("http://localhost:5000/login", {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({
                username: username,
                password: password,
                authCookie: cookies.get("authCookie") + ""
            }),
            headers: { 'Content-Type': 'application/json'},
        }).then(() => {});
    }

    if (authData.loggedIn === true) {
        return <Redirect to={"/messages"} />
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name={"username"} onChange={(e) => setUsername(e.target.value)}></input><br/>
            <input type={"password"} name={"password"} onChange={(e) => setPassword(e.target.value)}></input><br/>
            <button type={"submit"}>log in</button>
        </form>
    )
}