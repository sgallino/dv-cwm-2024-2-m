import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, startAfter, startAt } from "firebase/firestore";
import { db } from "./firebase";

export async function createPost(data) {
    return addDoc(
        collection(db, 'posts'),
        {
            ...data,
            created_at: serverTimestamp(),
        }
    );
}

export async function fetchPosts() {
    const posts = await getDocs(
        query(
            collection(db, 'posts'),
            orderBy('created_at', 'desc'),
            limit(3),
        )
    );

    return posts.docs.map(post => {
        return {
            id: post.id,
            user_id: post.data().user_id,
            email: post.data().email,
            title: post.data().title,
            body: post.data().body,
            created_at: post.data().created_at.toDate(),
        }
    });
}

export async function fetchPostsFrom(created_at) {
    const posts = await getDocs(
        query(
            collection(db, 'posts'),
            orderBy('created_at', 'desc'),
            limit(3),
            startAfter(created_at),
        )
    );

    return posts.docs.map(post => {
        return {
            id: post.id,
            user_id: post.data().user_id,
            email: post.data().email,
            title: post.data().title,
            body: post.data().body,
            created_at: post.data().created_at.toDate(),
        }
    });
}

export async function deletePost(id) {
    return deleteDoc(doc(db, `posts/${id}`));
}