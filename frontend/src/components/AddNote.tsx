import React, { useState, useRef } from "react";
import Alert from "../modals/AlertModal";
import useRequest from "../hooks/useRequest";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { postActions } from "../redux-store/postSlice";
import generateId from "../utilities/generateId";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from '@mui/material/CircularProgress';
import styles from "./AddNote.module.css"

export default function AddNote() {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(state => state.post.posts);
  const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);

  const titleRef = useRef<HTMLInputElement>(null);
  const desRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [alertMessage,setAlertMessage] = useState("");
  const [alertOn, setAlertOn] = useState(false);
  const { addPost: addPostRequest } = useRequest();
  const [pending, setPending] = useState(false);

  function handleTitleOn() {
    if (expanded === false) {
      setExpanded(true);
    }
  }

  function handleTitleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      desRef.current!.focus();
    }
  }

  function handleDesKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      titleRef.current!.focus();
    }
  }

  // ------------------------ SUBMIT A POST ----------------------------- //

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // ---------------- FORM VALIDATION ----------------- //
    if (expanded === false) {
      setAlertMessage("โปรดระบุข้อความ");
      setAlertOn(true);
      return;
    }
    const item = titleRef.current!.value.trim() || "";
    const des = desRef.current!.value.trim() || "";
    if (!item && !des) {
      setAlertMessage("โปรดระบุข้อความ");
      setAlertOn(true);
      return;
    }
    if (item.length > 25) {
      setAlertMessage("หัวข้อยาวเกินไป");
      setAlertOn(true);
      return;
    }
    if (item.length !== 0 && des.length > 95) {
      setAlertMessage("รายละเอียดยาวเกินไป");
      setAlertOn(true);
      return;
    } else if (item.length === 0 && des.length > 120) {
      setAlertMessage("รายละเอียดยาวเกินไป");
      setAlertOn(true);
      return;
    }

    // SUCCESS
    // ---------------- ONLINE ----------------- //
    if (isLoggedIn) {
      setPending(true);
      (async() => {
        try {
          // http request
          const addRequestResponse = await addPostRequest({item:item,des:des});
          // redux 
          dispatch(postActions.addPost({id: addRequestResponse.id, item, des, date: addRequestResponse.date}));
          setPending(false);
        } catch (error) {
          const err = error as Error;
          console.log(err.message);
          if (err.message === "No information sent") {
            setPending(false);
          }
        }
      }) ();
      
    // ---------------- OFFLINE ----------------- //
    } else {
      // prepare post data
      const newItemId = generateId();
      const getDate = new Date().getTime();
      const newPosts = [
        ...posts,{
          _id: newItemId,
          item: item,
          des: des,
          date: getDate,
        }
      ];
      // local storage
      localStorage.setItem("myPostIt", JSON.stringify(newPosts));
      // redux
      dispatch(postActions.addPost({id: newItemId, item, des, date: getDate}))
    }
    
    titleRef.current!.value = "";
    desRef.current!.value = "";
    desRef.current!.focus();
  }

  // -------------------------------------------------------------------- //

  function closeModal() {
    setAlertOn(false);
  }

  window.onkeydown = (e) => {
    if (alertOn) {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    }
  }

  return (
    <>
    {alertOn && <Alert message={alertMessage} onClose={closeModal} />}

    <div className={styles["Add-item"]}>

      {/* FORM */}
      <form onSubmit={handleSubmit}>

        <div className={` ${styles["Two-input"]} ${expanded ? styles.cursorNone : styles.cursorPointer}`}>

          {/* TITLE */}
          {expanded && <input
            className={styles["title-input"]}
            onKeyDown={handleTitleKeyPress}
            type="text"
            placeholder="หัวข้อ (optional)"
            autoComplete="off"
            ref={titleRef}
          ></input>}
          
          {/* DESCRIPTION */}
          <input
            className={styles["des-input"]}
            onClick={handleTitleOn}
            onKeyDown={handleDesKeyDown}
            type="text"
            placeholder="โพสต์อิท !"
            autoComplete="off"
            ref={desRef}
          ></input>
          
        </div>

        {/* SUBMIT BUTTON */}
        {!pending && <button
          type="submit"
        >
          <AddIcon />
        </button>}

      </form>
      
      {/* SPINNER WHEN ADDING A NEW POST */}
      {pending && <CircularProgress color="inherit" className={styles["spinner-ui"]} />}
    </div>
    </>
  );
}
