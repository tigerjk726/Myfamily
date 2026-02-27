import { db } from './firebase-config.js';

const firestore = db;

// Function to create a new post
async function createPost(collection, title, content) {
    try {
        const docRef = await firestore.collection(collection).add({
            title: title,
            content: content,
            author: 'Anonymous', // Or get the current user's name
            createdAt: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding document: ", error);
        return null;
    }
}

// Function to get all posts from a collection
async function getPosts(collection) {
    try {
        const snapshot = await firestore.collection(collection).orderBy("createdAt", "desc").get();
        const posts = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        return posts;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}

// Function to get a single post
async function getPost(collection, id) {
    try {
        const doc = await firestore.collection(collection).doc(id).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document: ", error);
        return null;
    }
}

// Function to update a post
async function updatePost(collection, id, newData) {
    try {
        await firestore.collection(collection).doc(id).update(newData);
        console.log("Document updated");
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

// Function to delete a post
async function deletePost(collection, id) {
    try {
        await firestore.collection(collection).doc(id).delete();
        console.log("Document deleted");
    } catch (error) {
        console.error("Error deleting document: ", error);
    }
}

export { createPost, getPosts, getPost, updatePost, deletePost };
