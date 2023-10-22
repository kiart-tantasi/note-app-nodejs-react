import React, {useRef, useEffect, useState} from 'react';
import ReactDOM from "react-dom";
import { useNavigate, useParams } from 'react-router-dom';
import useRequest from "../hooks/useRequest";
// CSS AND MUI
import styles from "./EditModal.module.css";
import CircularProgress from '@mui/material/CircularProgress';
// REDUX
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { postActions } from '../redux-store/postSlice';

function ModalOverlay() {

    // PARAMS
    const { postId } = useParams();

    // REDUX
    const dispatch = useAppDispatch();
    const { posts} = useAppSelector(state => state.post);
    const thePost = posts.find(x => x._id.toString() === postId);
    const { isLoggedIn } = useAppSelector(state => state.auth);

    // useRequest()
    const { editPost: editPostRequest } = useRequest();

    // NAVIFATE
    const navigate = useNavigate();

    // STATES
    const titleRef = useRef<HTMLInputElement>(null);
    const desRef = useRef<HTMLTextAreaElement>(null);
    const [ borderStyle, setBorderStyle ] = useState({"border":"1px solid rgba(0,0,0,0.5)"});
    const [ desBorderStyle, setDesBorderStyle ] = useState({"border":"1px solid rgba(0,0,0,0.5)"});

    useEffect(() => {

        // SHOW POST ONLY WHEN READY
        if (thePost && !thePost.pending) {
            titleRef.current!.value = thePost.item || "";
            desRef.current!.value = thePost.des || "";
            desRef.current!.focus();

        // WHEN DATA IS NOT READY
        } else if (!thePost && !thePost!.pending) {
            console.log("loading data for editing...");
        }

    }, [thePost])

    // HANDLING ARROWN DOWN AND ENTER BUTTON

    function handleTitleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            desRef.current!.focus();
        }
    }

    function handleDesKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    }

    // --------------------- SUBMIT TO EDIT A POST --------------------- //

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        
        const id: string | undefined = postId;
        const item = titleRef.current!.value.trim();
        const des = desRef.current!.value.trim();

        // -- FUNCTIONS TO MAKE TITLE AND DESCRIPTION'S BORDER RED -- //
        function setTitleRed() {
            setBorderStyle({"border":"1px solid red"});
            setTimeout(() => {
                setBorderStyle({"border":"1px solid rgba(0,0,0,0.5)"});
            }, 3000);
        }
        function setDesRed() {
            setDesBorderStyle({"border":"1px solid red"});
            setTimeout(() => {
                setDesBorderStyle({"border":"1px solid rgba(0,0,0,0.5)"});
            }, 3000);
        }

        // FORM VALIDATION

        // NO CHANGES FOUND
        if (item === thePost!.item && des === thePost!.des) {
            console.log("no changes found.");
            navigate("/posts");
            return;
        }

        // EMPTY VALUES
        if (item.length === 0 && des.length === 0) {
            setTitleRed();
            setDesRed();
            return;
        }

        // TITLE > 25 && DESCRIPTION > 95
        if (item.length > 25 && des.length > 95) {
            setTitleRed();
            setDesRed();
            return;
        }

        // TITLE > 25
        if (item.length > 25) {
            setTitleRed();
            return;
        }

        // DESCRIPTION > 95 WITH TITLE
        if (des.length > 95 && item.length !== 0) {
            setDesRed();
            return;
        }

        // DESCRIPTION > 120 WITHOUT TITLE
        if (des.length > 120 && item.length === 0) {
            setDesRed();
            return;
        }

        // SUCCESS

        // ---------------- ONLINE ---------------- //   
        if (isLoggedIn) {
            // TURN ON PENDING (FOR SPINNER)
            dispatch(postActions.turnPendingOn(id!));

            // SEND REQUEST (with useRequest())
            (async() => {
                try {

                    // SEND REQUEST
                    await editPostRequest({item:item,des:des,id:id!});

                    // DISPATCH
                    dispatch(postActions.editPost({id:id!, item, des}));

                    // NAVIGATE TO "/posts"
                    navigate("/posts", {replace:true});

                } catch(err) {
                    console.log(err);
                    navigate("/posts", {replace:true});
                }
            }) ();

        // ---------------- OFFLINE ---------------- // 
        } else {
            // EDIT POSTS FROM REDUX (useAppSelector)
            const newPosts = posts.map((x) => (x._id.toString() === id!.toString() ? { ...x, item: item, des: des } : x));

            // SET IN LOCAL STORAGE
            localStorage.setItem("myPostIt", JSON.stringify(newPosts));

            // DISPATCH
            dispatch(postActions.editPost({id:id!, item, des}));

            // NAVIGATE TO "/posts"
            navigate("/posts", {replace:true});
        }
    }
    // ----------------------------------------------------------------- //

    function handleCancel() {
        navigate("/posts",{ replace: true });        
    }

    window.onkeydown = (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
      }

    return (
        <div>

            {/* BACKDROP */}
            <div onClick={handleCancel} className={`backdrop-div ${styles.modalBackdrop}`} />

            {/* MODAL */}
            <div className={styles.modalBox}>

                <form onSubmit={handleSubmit}>

                    {/* TITLE */}
                    <input type="text" ref={titleRef} className={styles.modalInput} style={borderStyle} onKeyDown={handleTitleKeyDown} />
                    <br/><br/>

                    {/* DESCRIPTION */}
                    <textarea onKeyDown={handleDesKeyDown} ref={desRef} className={styles.modalTextarea} style={desBorderStyle} />

                    {/* SPINNER || BUTTONS */}
                    {thePost!.pending ?

                        // SPINNER (WHEN PENDING)
                        <div className={styles["spinnng-div"]}><CircularProgress size={35} color="inherit" /></div>:

                        // BUTTONS
                        <div className={styles.modalButtons}>
                            <button type="button" onClick={handleCancel}>ยกเลิก</button>
                            <button type="submit" className={styles["submit-button"]}>แก้ไข</button>
                        </div>

                    }

                </form>

            </div>

        </div>
    )
}

export default function EditModal () {
    return ReactDOM.createPortal(
            <ModalOverlay />,
            document.getElementById("edit-modal") as HTMLElement
        );
}
// ReactDOM.createPoral to link to div id "edit-modal" in index.html