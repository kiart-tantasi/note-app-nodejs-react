import { useCallback, useState } from "react";
import { useAppDispatch } from "./useRedux";
import { refreshData } from "../redux-store/dataRefresher";
import getLocalStoragePosts from "../utilities/getLocalStoragePosts";

import { AddPostReturn, FetchOptionsModel, PostModel } from "../interfaces/interfaces";
import { FetchDataReturn } from "../interfaces/interfaces";

export default function useRequest() {

    // REDUX
    const dispatch = useAppDispatch();
    const refreshDataHandler = () => {
        refreshData(dispatch);
    }

    // THINGS TO RETURN FROM THIS HOOK
    const [isLoading , setIsLoading] = useState(false);
    const [data, setData] = useState<FetchDataReturn | AddPostReturn>();
    const [success, setSuccess] = useState(false);
    
    // GET POSTS AND USERNAME
    const getPostsAndUserName = useCallback( async() => {
        // TURN LOADING ON
        setIsLoading(true);
        let initialPosts:PostModel[];
        let userName;
        let isLoggedIn;

        try {
          const response = await fetch("/api/user", {credentials:"include"});
          if (!response.ok) throw new Error("offline mode activated");
          // ------------ ONLINE ----------- //
          const userData = await response.json();
          initialPosts = userData.posts;
          userName = userData.userName;
          isLoggedIn = true;
        }
        
        catch (error) {
          // ------------ OFFLINE ----------- //
          const localStoragePosts = getLocalStoragePosts();
          initialPosts = localStoragePosts;
          userName = null;
          isLoggedIn = false;
          const err = (error as Error);
          console.log(err.message || "getting posts failed.");
        }

        // TURN LOADING OFF
        setIsLoading(false);

        // THERE ARE 2 WAYS TO GET THIS DATA

        // 1. FROM THIS HOOK (data property)
        setData({
            posts: initialPosts,
            isLoggedIn: isLoggedIn,
            userName: userName
        });

        // 2. RETURN DIRECTLY
        return {
            posts: initialPosts,
            isLoggedIn: isLoggedIn,
            userName: userName
        } 
    }, []);
    
    async function addPost(requestData: {item:string;des:string}) {
        // TURN LOADING ON
        setIsLoading(true);

        const options: FetchOptionsModel = {
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ item: requestData.item, des: requestData.des }),
            credentials: "include"
        }

        // RETURN FETCHED DATA
        return fetch("/api/posts", options)
        .then((response) => {

            // OK
            if (response.ok) {
              return response.json();

              // MISSING BOTH TITLE AND DESCRIPTION
            } else if (response.status === 400) {
              setIsLoading(false);
              throw new Error("No information sent");

              // NO AUTHENITCATION
            } else {
              refreshDataHandler();
              setIsLoading(false);
              throw new Error("No authentication");
            }
        })
        .then(data => {
            // TURN LOADING OFF
            setIsLoading(false);

            // THERE ARE 2 WAYS TO GET THIS DATA

            // 1. FROM THIS HOOK (data property)
            setData({
                id: data.id,
                date: data.date
            });

            // 2. RETURN DIRECTLY
            return {
                id: data.id,
                date: data.date
            }
        })
        // NO CATCHING ERROR HERE
    }

    async function deletePost(requestData:{id:string}) {
        // TURN LOADING ON AND SET SUCCESS TO FALSE
        setIsLoading(true);
        setSuccess(false);

        // RETURN FETCHED DATA
        return fetch("/api/posts/"+ requestData.id.toString(), {method:"DELETE", credentials: "include"})
        .then((res) => {

            // SUCCESS
            // THERE ARE 2 WAYS TO KNOW IF IT IS SUCCESS
            // 1. FROM THIS HOOK (success property)
            // 2. RETURN DIRECTLY "success"
            if (res.ok) {
                setIsLoading(false);
                setSuccess(true);
                return "success";

            // NO AUTHENTICATION
            } else if (res.status === 403) {
                refreshDataHandler();
                setIsLoading(false);
                setSuccess(false);
                throw new Error("No authentication");

            // OTHER ERRORS
            } else {
                refreshDataHandler();
                setIsLoading(false);
                setSuccess(false);
                throw new Error("deleting failed.")
            }
        })
        // NO CATCHING ERROR HERE
    }

    async function editPost(requestData:{item:string;des:string;id:string}) {
        // TURN LOADING ON AND SET SUCCESS TO FALSE
        setIsLoading(true);
        setSuccess(false);
        const options: FetchOptionsModel = {
            method:"PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({item: requestData.item, des:requestData.des}),
            credentials: "include"
        }

        return fetch("/api/posts/" + requestData.id, options)
        .then(response => {
            // SUCCESS
            // THERE ARE 2 WAYS TO KNOW IF IT IS SUCCESS
            // 1. FROM THIS HOOK (success property)
            // 2. RETURN DIRECTLY "success"
            if(response.ok) {
                setIsLoading(false);
                setSuccess(true);
                return "success";

            // MISSING BOTH TITLE AND DESCRIPTION
            } else if (response.status === 400) {
                setIsLoading(false);
                setSuccess(false);
                throw new Error("No information sent")

            // NO AUTHENTICATION
            } else if (response.status === 403) {
                setIsLoading(false);
                setSuccess(false);
                refreshDataHandler();
                throw new Error("No authentication")

            // OTHER ERRORS
            } else {
                setIsLoading(false);
                setSuccess(false);
                refreshDataHandler();
                throw new Error("updating failed.")
            }
        })
        // NO CATCHING ERROR HERE
    }

    // ------------------------ RETURN FUNCTIONS FOR useRequest() ------------------------ //
    return {getPostsAndUserName, addPost, editPost, deletePost, isLoading, data, success};
}