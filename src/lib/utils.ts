import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFilenameFromUrl = (url: string): string => {
  try {
    // Handle both full URLs and relative paths
    let pathname;
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      pathname = urlObj.pathname;
    } else {
      pathname = url;
    }
    
    // Extract filename from path
    const filename = pathname.split('/').pop() || '';
    
    // Decode URL-encoded characters
    return decodeURIComponent(filename);
  } catch (error) {
    console.error('Error parsing filename from URL:', error);
    return 'document.pdf';
  }
};

// timestamp utility function
export const formatTimestamp = (dateString: string, detailed: boolean = false): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Set times to midnight for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeFormat = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const monthDayFormat = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  let dayString: string;

  if (messageDate.getTime() === today.getTime()) {
    dayString = 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    dayString = 'Yesterday';
  } else {
    dayString = monthDayFormat;
  }
  
  if (detailed) {
    return `${dayString} at ${timeFormat}`;
  } else {
    return dayString;
  }
};
