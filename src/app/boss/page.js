"use client";
import {useEffect} from "react";
import {useParams, useRouter, useSearchParams} from 'next/navigation'
import WebSettingsManager from "@/lib/WebSettingsManager";
import FullScreenLoader from "@/components/FullScreenLoader";

const Boss = ({}) => {

    const router = useRouter();

    const batch_name = WebSettingsManager.getValue("batch_name")[0];

    useEffect(() => {
        if(batch_name)
        {
            if(WebSettingsManager.getValue("khazana_enabled")){
                router.push(`boss/khazana/${batch_name}`);
            }
            else{
                router.push(`boss/batch/${batch_name}`)
            }
        }
    },[]);

    return (
        <div>
        <FullScreenLoader/>
        </div>
    );
};

export default Boss;