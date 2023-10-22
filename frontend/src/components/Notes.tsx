import Note from "./Note";
import styles from "./Notes.module.css";
import { useAppSelector } from "../hooks/useRedux";

export default function Notes() {
  const posts = useAppSelector(state => state.post.posts);
  const reversedPosts = [...posts].reverse();
  // REVERSE TO BRING THE LATEST POSTS FIRST

  return (
    <div className={styles.notes}>      
      {reversedPosts.map((x) => {
        return (
          <Note
            key={x._id}
            id={x._id}
            item={x.item}
            des={x.des}
            date={x.date}
          />
        );
      })}
    </div>
  );
}