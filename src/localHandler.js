"use client"
// check if client_id is set in localStorage

import Utils from './lib/utils';

const ISSERVER = typeof window === "undefined";

class LocalHandler {
    static getClientId() {

        if (!ISSERVER) {
            let clientId = localStorage.getItem("client_id");
            if (clientId === null) {
                clientId = Utils.generateUUIDv4();
                localStorage.setItem("client_id", clientId);
            }
            return clientId;
        }
    }


    static getSessionId(reload = false) {
        if(!ISSERVER){
            let sessionId = localStorage.getItem("session_id");
            if (sessionId === null || reload) {
                sessionId = Utils.generateUUIDv4();
                localStorage.setItem("session_id", sessionId);
            }
            return sessionId;
        }
    }

    static setClientId(clientId) {
        localStorage.setItem("client_id", clientId);
    }

    static clearClientId() {
        localStorage.removeItem("client_id");
    }

    static setBossDownload(
        id="",
        state={}){

        if(!ISSERVER) {
            id = (id || Utils.generateUUIDv4());
            localStorage.setItem(id, JSON.stringify(state));
            return id;
        }

    };

    static getBossDownload(id="") {
        if(!ISSERVER) {
            const state = localStorage.getItem(id);
            if (state !== null) {
                return JSON.parse(state);
            }
        }
    };

}


export default LocalHandler;