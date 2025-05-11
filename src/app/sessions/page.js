"use client";

import { useEffect, useState } from "react";
import localHandler from "@/localHandler";
import Session from "@/app/sessions/components/Session";
const SessionPage = ({  }) => {
    const [clientId, setClientId] = useState(localHandler.getClientId());


   return(
       clientId && <Session clientId={clientId}/>
   )

};

export default SessionPage;