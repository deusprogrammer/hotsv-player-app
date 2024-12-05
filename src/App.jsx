import {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import axios from 'axios';
import GameRoute from './routes/GameRoute.jsx';
import Dev from './devComponents/Dev.jsx';
import './App.css';

const App = () => {
    const login = () => {
        if (process.env.NODE_ENV === "development") {
            window.location = `https://deusprogrammer.com/util/auth/dev?redirect=${window.location.protocol}//${window.location.hostname}:${window.location.port}${process.env.PUBLIC_URL}/dev`;
            return;
        }
        window.localStorage.setItem("twitchRedirect", "https://deusprogrammer.com/streamcrabs");
        window.location.replace("https://deusprogrammer.com/api/auth-svc/auth/twitch");
    }
    
    useEffect(() => {
        // If no access token is present, don't retrieve their information
        if (!localStorage.getItem("accessToken")) {
            return;
        }

        (async () => {
            try {
                let res = await axios.get(`https://deusprogrammer.com/api/profile-svc/users/~self`, {
                        headers: {
                            "X-Access-Token": localStorage.getItem("accessToken")
                        }
                    }
                );
            } catch (error) {
                login();
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/games/:channelId' element={<GameRoute />} />
                <Route path='/dev' element={<Dev />} />
            </Routes>
        </BrowserRouter>
    )
};

export default App;
