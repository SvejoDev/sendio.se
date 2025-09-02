"use client";

import { useEffect, useRef, useCallback } from "react";

export interface AutoSaveData {
  subject: string;
  fromName: string;
  replyTo: string;
  elements: any[];
  template: any;
  lastSaved: number;
}

export function useAutoSave<T extends AutoSaveData>(
  data: T,
  key: string,
  interval: number = 3000
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousDataRef = useRef<string>("");

  const saveData = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const timestamp = Date.now();
      const saveData = {
        ...data,
        lastSaved: timestamp
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      console.log("💾 Auto-saved:", key, 'Elements count:', saveData.elements?.length || 0);
      // Update the data reference to include the new timestamp
      previousDataRef.current = JSON.stringify({
        subject: data.subject,
        fromName: data.fromName,
        replyTo: data.replyTo,
        elements: data.elements,
        template: data.template
      });
      return timestamp;
    } catch (error) {
      console.error("Failed to auto-save:", error);
      return null;
    }
  }, [data, key]);

  const loadData = useCallback((): T | null => {
    try {
      if (typeof window === 'undefined') return null;
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
    return null;
  }, [key]);

  const clearSavedData = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
      console.log("Cleared saved data:", key);
    } catch (error) {
      console.error("Failed to clear saved data:", error);
    }
  }, [key]);

  const hasUnsavedChanges = useCallback(() => {
    const saved = loadData();
    if (!saved) return false;
    
    const currentDataString = JSON.stringify({
      subject: data.subject,
      fromName: data.fromName,
      replyTo: data.replyTo,
      elements: data.elements,
      template: data.template
    });
    
    const savedDataString = JSON.stringify({
      subject: saved.subject,
      fromName: saved.fromName,
      replyTo: saved.replyTo,
      elements: saved.elements,
      template: saved.template
    });
    
    return currentDataString !== savedDataString;
  }, [data, loadData]);

  // Auto-save effect
  useEffect(() => {
    const currentDataString = JSON.stringify({
      subject: data.subject,
      fromName: data.fromName,
      replyTo: data.replyTo,
      elements: data.elements,
      template: data.template
    });

    if (currentDataString !== previousDataRef.current) {
      previousDataRef.current = currentDataString;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveData();
      }, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveData, interval]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        saveData();
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveData, hasUnsavedChanges]);

  return {
    loadData,
    clearSavedData,
    hasUnsavedChanges,
    forceSave: saveData
  };
}