export type PostModel = {
  _id: string, 
  item: string, 
  des: string, 
  date: number, 
  pending: boolean
};

export type FetchOptionsModel = {
  method:string; headers: {}; 
  body: string; 
  credentials: RequestCredentials;
}

// THESE TWO ARE FOR useRequest()
export type FetchDataReturn = {
  posts: PostModel[];
  isLoggedIn: boolean;
  userName: string;
}
export type AddPostReturn = {
  id: string;
  date: number;
}