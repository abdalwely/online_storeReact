# Firebase Setup Guide

## Overview
This application uses Firebase for authentication and Firestore for the database. The current implementation has been optimized to minimize composite index requirements.

## Firestore Index Requirements

### Current Status
The application has been optimized to avoid most composite index requirements by:
- Using client-side filtering and sorting instead of server-side where possible
- Simplifying queries to use only single-field indexes
- Adding comprehensive error handling for query failures

### If You Need Performance Optimization
For production deployments with large datasets, you may want to create composite indexes for better performance:

1. **Products Collection Indexes:**
   ```
   Collection: products
   Fields: storeId (Ascending), status (Ascending), createdAt (Descending)
   
   Collection: products  
   Fields: storeId (Ascending), featured (Ascending), status (Ascending)
   ```

2. **Orders Collection Indexes:**
   ```
   Collection: orders
   Fields: storeId (Ascending), createdAt (Descending)
   
   Collection: orders
   Fields: customerId (Ascending), createdAt (Descending)
   ```

3. **Categories Collection Indexes:**
   ```
   Collection: categories
   Fields: storeId (Ascending), isActive (Ascending), order (Ascending)
   ```

## How to Create Indexes

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Click on "Indexes" tab
5. Create composite indexes as needed

### Option 2: Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy indexes from firestore.indexes.json
firebase deploy --only firestore:indexes
```

### Option 3: Automatic Index Creation
When you encounter index errors in production, Firebase will provide direct links to create the required indexes automatically.

## Performance Considerations

### Current Implementation (Client-side filtering)
- **Pros**: No index setup required, works immediately
- **Cons**: Downloads more data, slower for large datasets

### With Composite Indexes
- **Pros**: Faster queries, less bandwidth usage
- **Cons**: Requires index setup, slightly more complex deployment

## Recommendation
- **Development/Small Scale**: Use current implementation (no indexes needed)
- **Production/Large Scale**: Create composite indexes for better performance

## Security Rules
Don't forget to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Store owners can manage their stores
    match /stores/{storeId} {
      allow read: if true; // Public read for store fronts
      allow write: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Products are readable by all, writable by store owners
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/stores/$(resource.data.storeId)) &&
        get(/databases/$(database)/documents/stores/$(resource.data.storeId)).data.ownerId == request.auth.uid;
    }
    
    // Orders are readable by customers and store owners
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.customerId == request.auth.uid ||
         exists(/databases/$(database)/documents/stores/$(resource.data.storeId)) &&
         get(/databases/$(database)/documents/stores/$(resource.data.storeId)).data.ownerId == request.auth.uid);
    }
    
    // Categories are readable by all, writable by store owners
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null &&
        exists(/databases/$(database)/documents/stores/$(resource.data.storeId)) &&
        get(/databases/$(database)/documents/stores/$(resource.data.storeId)).data.ownerId == request.auth.uid;
    }
  }
}
```

## Environment Variables
Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Remember to update the Firebase configuration in `client/lib/firebase.ts` to use environment variables for production deployment.
