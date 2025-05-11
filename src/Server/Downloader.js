import API from "@/Server/api";
import {debug} from "@/Debugger";

class Downloader {
    constructor(
        client_id,
        session_id,
        payload = {},
        onStartEach = () => {},
        onUpdate = () => {},
        onEndEach = () => {},
        onError = () => {},
        onErrorEach = () => {},
        onEnd = () => {}
    ) {
        this.clientId = client_id;
        this.sessionId = session_id;
        this.payload = payload;

        this.onStartEach = onStartEach;
        this.onUpdate = onUpdate;
        this.onEndEach = onEndEach;
        this.onError = onError;
        this.onErrorEach = onErrorEach;
        this.onEnd = onEnd;
        this.taskIds = [];
        this.progress = 0.0;
        this.interval = 100;

    };

    _lodgeSessionCallback = async (response) => {
        debug.info("Session succesfully lodged");
        var res = await response.json();
        this.taskIds = res.task_ids;
        debug.info("Session loged," + this.taskIds);
    };

    lodgeSession = async () => {
        return(
            fetch(
                API.lodgeSession(this.clientId, this.sessionId).url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.payload),
                }
            ).then(this._lodgeSessionCallback)
                .catch(this.onError)
        )
    };


    _startTasKCallback = async  (response, taskId) => {
        var res = await response.json();
        debug.info("Download succesfully ran ");
        debug.info("Retrieving ran", res);
        this.onStartEach({
            response : res,
            taskId :  taskId,
        })


    };

    startTask = async (taskId) => {

            await fetch(API.runTask(taskId).url)
                .then((res) => this._startTasKCallback(res,taskId))
                .catch(this.onErrorEach)

            this.onStartEach(taskId);
            await this.trackProgress(taskId);
            //this.onEndEach();

    };

    trackProgress = async (taskId) => {
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try{
                    const response = await fetch(API.progress(taskId).url);
                    const data = await response.json();


                    if(data.status === "completed"){
                        this.onEndEach(data);
                        clearInterval(intervalId);
                        resolve(data);
                    }
                    else if (data.status === "failed"){
                        this.onErrorEach(data);
                        clearInterval(intervalId);
                        reject(data);
                    }
                    this.onUpdate(data);
                }
                catch(e) {
                    console.error(e);
                    clearInterval(intervalId);

                    reject(e);
                }

            },this.interval);
        });
    };

}

export default  Downloader;