import EditModal from "../modals/EditModal";
import {Routes, Route} from "react-router-dom";

export default function EditRoute() {
    return (
        <Routes>
            <Route path="edit">
                <Route path=":postId" element={<EditModal />} />
            </Route>
        </Routes>
    )
}
// DYNAMIC REACT ROUTER