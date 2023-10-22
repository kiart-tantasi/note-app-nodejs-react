import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PostModel } from "../interfaces/interfaces";

const initialState:{posts:PostModel[];} = {
    posts: []
}

// createAsyncThunk
const fetchPosts = createAsyncThunk(
    "posts/fetchPosts",
    async() => {
        try {
            const response: Response = await fetch("/api/posts");
            if (!response.ok) {
                throw new Error("cannot fetch posts");
            }
            const posts = await response.json();
            return posts;
        } catch (error) {
            const err = error as Error;
            console.log(err.message);
        }
    }
)

const postSlice = createSlice({
    name: "post",
    initialState: initialState,
    reducers: {

        // SET POSTS
        setPosts(state, action: PayloadAction<PostModel[]>) {
            state.posts = action.payload;
        },

        // ADD A POST
        addPost(state, action:PayloadAction<{id:string;item:string;des:string;date:number}>) {
            state.posts = [...state.posts,
                {
                    _id: action.payload.id,
                    item: action.payload.item,
                    des: action.payload.des,
                    date: action.payload.date,
                    pending: false
                }
            ];
        },

        // DELETE A POST
        deletePost(state, action:PayloadAction<string>) {
            state.posts = state.posts.filter(x => x._id !== action.payload);
        },

        // EDIT A POST
        editPost(state, action:PayloadAction<{id:string;item:string;des:string}>) {
            state.posts = state.posts.map(x => {
                if (x._id === action.payload.id) {
                    return {...x, item: action.payload.item, des: action.payload.des, pending: false};
                }
                return x;
            });
        },

        // TURN A POST'S PENDING ON
        turnPendingOn(state, action: PayloadAction<string>) {
            state.posts = state.posts.map(x => {
                if (x._id === action.payload) {
                    return {...x, pending: true};
                }
                return x;
            });
        }
    },

    // EXTRA REDUCERS (REDUX) ????
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.fulfilled, (state, action) => {
                console.log(action.payload);
            })
    }
})

export {fetchPosts}; // ???

export const postActions = postSlice.actions;
const postReducer = postSlice.reducer;
export default postReducer;
