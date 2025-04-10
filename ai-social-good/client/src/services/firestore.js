import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const ANALYSES = 'analyses';
const NOTIFICATIONS = 'notifications';
const REPORTS = 'reports';

export const firestoreService = {
  // Analyses
  async createAnalysis(data) {
    try {
      const analysisData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, ANALYSES), analysisData);
      return { id: docRef.id, ...analysisData };
    } catch (error) {
      console.error('Error creating analysis:', error);
      throw error;
    }
  },

  async getAnalyses(userId, options = {}) {
    try {
      const constraints = [where('userId', '==', userId)];
      
      if (options.type) {
        constraints.push(where('type', '==', options.type));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, ANALYSES), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting analyses:', error);
      throw error;
    }
  },

  // Notifications
  async createNotification(data) {
    try {
      const notificationData = {
        ...data,
        read: false,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, NOTIFICATIONS), notificationData);
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, NOTIFICATIONS, notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, NOTIFICATIONS),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    });
  },

  // Reports
  async createReport(data) {
    try {
      const reportData = {
        ...data,
        createdAt: serverTimestamp(),
        status: 'pending',
      };
      const docRef = await addDoc(collection(db, REPORTS), reportData);
      return { id: docRef.id, ...reportData };
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async updateReportStatus(reportId, status) {
    try {
      const reportRef = doc(db, REPORTS, reportId);
      await updateDoc(reportRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  async getReports(userId, options = {}) {
    try {
      const constraints = [where('userId', '==', userId)];
      
      if (options.status) {
        constraints.push(where('status', '==', options.status));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(db, REPORTS), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting reports:', error);
      throw error;
    }
  },

  // Delete operations
  async deleteAnalysis(analysisId) {
    try {
      await deleteDoc(doc(db, ANALYSES, analysisId));
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  },

  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS, notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async deleteReport(reportId) {
    try {
      await deleteDoc(doc(db, REPORTS, reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },
}; 