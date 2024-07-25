import React from 'react';
import { DeleteComment, UpdateComment } from '../redux/CommentSlice';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

function CommentDropDown({ post, comment, currentuser }) {
    const isCommentAuthor = comment.authorId === currentuser._id;
    const isPostOwner = post.author._id === currentuser._id;

    const dispatch = useDispatch();

    const handleReport = () => {
        Swal.fire({
            title: 'Report Comment?',
            text: "Do you really want to report this Comment ?.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, report it!'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    Swal.fire(
                        'Reported!',
                        'Comment reported',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'There was an error reporting the comment.',
                        'error'
                    );
                }
            }
        });
    };

    const handleCommentDelete = () => {
        Swal.fire({
            title: 'Delete comment?',
            text: "Do you really want to delete this comment?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(DeleteComment(comment._id));
                    Swal.fire(
                        'Deleted!',
                        'Your comment has been deleted.',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'There was an error deleting the comment.',
                        'error'
                    );
                }
            }
        });
    };

    const handleCommentEdit = () => {
        Swal.fire({
            title: 'Edit comment',
            input: 'textarea',
            inputLabel: 'Your comment',
            inputValue: comment.body,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to write something!';
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(UpdateComment({ id: comment._id, body: result.value }));
                    Swal.fire(
                        'Updated!',
                        'Your comment has been updated.',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Error!',
                        'There was an error updating the comment.',
                        'error'
                    );
                }
            }
        });
    };

    return (
        <div className="dropdown-menu_2">
            {isCommentAuthor && (
                <>
                    <button onClick={handleCommentEdit}>
                        <i className="fa-solid fa-pen"></i> Edit
                    </button>
                    <button onClick={handleCommentDelete}>
                        <i className="fa-solid fa-trash"></i> Delete
                    </button>
                </>
            )}
            {isPostOwner && isCommentAuthor == false && (
                <>
                    <button onClick={handleCommentDelete}>
                        <i className="fa-solid fa-trash"></i> Delete
                    </button>
                    <button onClick={handleReport}>
                        <i className="fa fa-flag" aria-hidden="true"></i> Report
                    </button>
                </>
            )}
            {isCommentAuthor == false && isPostOwner == false && (
                <button onClick={handleReport}>
                    <i className="fa fa-flag" aria-hidden="true"></i> Report
                </button>
            )}
        </div>
    );
}

export default CommentDropDown;
