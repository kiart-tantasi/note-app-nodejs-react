import generateId from "./generateId";
import { PostModel } from "../interfaces/interfaces";

const DEFAULT_POSTS = [
    {_id: generateId(), item: "โพสต์แรกของฉัน", des:"ดูแลสุขภาพด้วยงับ", date: new Date().getTime(), pending: false},
    {_id: generateId(), item: "ประชุมเช้า", des:"วันพุธ เข้าzoomก่อน 10 โมง", date: new Date().getTime(), pending: false},
    {_id: generateId(), item: "จันทร์หน้า", des:"ทำ OT ...", date: new Date().getTime(), pending: false},
    {_id: generateId(), item: "หยุดปีใหม่", des:"วันศุกร์หน้าแล้ว!", date: new Date().getTime(), pending: false}
];

export default function getLocalStoragePosts():PostModel[] {

    const localStoragePosts = localStorage.getItem("myPostIt");
    const updated = localStorage.getItem("myPostItUpdate");

    //updated - just retrieve all local posts
    if (localStoragePosts && updated) {
        const parsedPosts = JSON.parse(localStoragePosts);
        return parsedPosts; 
    }

    // never updated - reverse posts first then use it
    else if (localStoragePosts && !updated) {
        const parsedPosts = JSON.parse(localStoragePosts);
        const reversedPosts = [...parsedPosts].reverse();
        localStorage.setItem("myPostIt", JSON.stringify(reversedPosts));
        localStorage.setItem("myPostItUpdate", JSON.stringify({reversedArray: true}));
        return reversedPosts;
    }

    //default (never use)
    else if (!localStoragePosts) {
        localStorage.setItem("myPostIt", JSON.stringify(DEFAULT_POSTS));
        localStorage.setItem("myPostItUpdate", JSON.stringify({reversedArray: true}));
        return DEFAULT_POSTS;
    }

    else {
        throw new Error("getting posts error."); // should not occur.
    }
}

// NEED MORE UTILITY FUNCTIONS TO ADD / EDIT / DELETE POSTS