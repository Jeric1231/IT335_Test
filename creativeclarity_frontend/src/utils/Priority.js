
export const Priority = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent'
};

export const PriorityColors = {
    [Priority.LOW]: '#4caf50',     // Green
    [Priority.MEDIUM]: '#ff9800',  // Orange
    [Priority.HIGH]: '#f44336',    // Red
    [Priority.URGENT]: '#9c27b0'   // Purple
};

export const PriorityList = Object.values(Priority);