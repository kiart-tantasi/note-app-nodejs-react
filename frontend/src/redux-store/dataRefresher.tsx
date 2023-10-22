import { AppDispatch } from ".";
import { authActions } from "./authSlice";
import { loadingActions } from "./loadingSlice";
import { notificationActions } from "./notificationSlice";
import { postActions } from "./postSlice";
import { PostModel } from "../interfaces/interfaces";
import getLocalStoragePosts from "../utilities/getLocalStoragePosts";

// *** THIS FUNCTION CAN ALSO BE CREATED IN THE FORM OF "THUNK" *** // 

// ------- WHEN APP STARTS OR USE useRequest() ------ //
export const refreshData = async(dispatch: AppDispatch) => {

  // TURN LOADING ON
  dispatch(loadingActions.turnOnIsLoading());

  // PREPARE 3 THINGS TO RETURN
  let initialPosts: PostModel[];
  let userName: string;
  let isLoggedIn: boolean;

  try {

    const response = await fetch("/api/user", {credentials:"include"});
    if (!response.ok) throw new Error("offline mode activated");
    // --------- ONLINE --------- //
    const userData = await response.json();
    initialPosts = userData.posts;
    userName = userData.userName;
    isLoggedIn = true;

  } catch (error) {

    // --------- OFFLINE --------- //
    const localStoragePosts = getLocalStoragePosts();
    initialPosts = localStoragePosts;
    userName = "";
    isLoggedIn = false;
    const err = (error as Error);
    console.log(err.message || "getting posts failed.");

  }

  // ------ ADD "pending" PROPERTY TO EVERY POST ------ //
  const transformedPosts = initialPosts.map(x => {
    return{...x, pending: false}
  });

  // DISPATCH: set posts / isLoggedIn / offlineNotification / username / turn loading off
  dispatch(postActions.setPosts(transformedPosts));
  dispatch(isLoggedIn ? authActions.logIn(): authActions.logOut());
  dispatch(isLoggedIn ? notificationActions.closeOfflineNotification() : notificationActions.openOfflineNotification()); // open noti if offline
  dispatch(authActions.setUserName(userName));
  dispatch(loadingActions.turnOffIsLoading());
};