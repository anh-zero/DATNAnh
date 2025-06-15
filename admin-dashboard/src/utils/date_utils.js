// filepath: c:\Users\kaito\Desktop\ADMIN\admin-dashboard\src\utils\date_utils.js
const formatDateForDb = (dateStringOrObject) => {
    if (!dateStringOrObject) return null;
    try {
        const date = new Date(dateStringOrObject);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Invalid date for formatDateForDb:", dateStringOrObject);
        return null; // Or throw error
    }
};

const formatTimeForDb = (timeString) => { // For TIME type 'HH:MM:SS'
    if (!timeString) return null;
    // Basic validation, can be more robust
    if (typeof timeString === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
        return timeString.length === 5 ? `${timeString}:00` : timeString;
    }
    // If it's a Date object, extract time. This is more complex if you need to handle timezones correctly.
    // For simplicity, assuming string input for TIME.
    console.error("Invalid time for formatTimeForDb:", timeString);
    return null;
};

module.exports = { formatDateForDb, formatTimeForDb };